/**
 * GET /api/email-accounts/oauth/google/callback
 *
 * Google redirects the user back here with `?code=…&state=…`. We:
 *   1. Verify the state cookie matches AND its user-id prefix matches the
 *      currently signed-in user (defence against CSRF + session-mixup).
 *   2. Exchange the code for tokens.
 *   3. Encrypt the refresh token at rest.
 *   4. Upsert the EmailAccount row (one per (userId, emailAddress)).
 *   5. Redirect to /automation/email-accounts with success.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  GMAIL_SEND_SCOPE,
} from '@/lib/google/oauth'
import { encrypt } from '@/lib/security/encryption'
import { env, features } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATE_COOKIE = 'cp_g_oauth_state'

function fail(reason: string): NextResponse {
  const url = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/automation/email-accounts?error=${encodeURIComponent(reason)}`
  return NextResponse.redirect(url, 302)
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return fail('not_signed_in')
  if (!features.googleOAuth) return fail('oauth_not_configured')
  if (!features.encryption) return fail('encryption_not_configured')

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateFromGoogle = url.searchParams.get('state')
  const errorFromGoogle = url.searchParams.get('error')
  if (errorFromGoogle) return fail(`google:${errorFromGoogle}`)
  if (!code || !stateFromGoogle) return fail('missing_params')

  // The state cookie is path-scoped to /api/email-accounts/oauth/google — it
  // is present on this callback because of that path scope.
  const cookieHeader = req.headers.get('cookie') ?? ''
  const cookieState = parseCookie(cookieHeader, STATE_COOKIE)
  if (!cookieState || cookieState !== stateFromGoogle) return fail('state_mismatch')

  const [statePrefixUserId] = stateFromGoogle.split('.')
  if (statePrefixUserId !== session.user.id) return fail('user_mismatch')

  // Exchange code for tokens.
  const redirectUri = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/api/email-accounts/oauth/google/callback`
  let tokens
  try {
    tokens = await exchangeGoogleCode({ code, redirectUri })
  } catch (err) {
    console.error('[oauth.google] token exchange failed', err)
    return fail('token_exchange_failed')
  }

  if (!tokens.refresh_token) {
    // No refresh token => account was previously linked; we can't operate
    // offline. Tell the user to revoke and reconnect.
    return fail('no_refresh_token')
  }

  // Verify the grant includes gmail.send — if the user un-checked it on the
  // consent screen we can't operate.
  const scopes = tokens.scope.split(/\s+/)
  if (!scopes.includes(GMAIL_SEND_SCOPE)) return fail('missing_gmail_send_scope')

  // Identify the connected mailbox.
  let userInfo: { email: string; name?: string }
  try {
    userInfo = await fetchGoogleUserInfo(tokens.access_token)
  } catch (err) {
    console.error('[oauth.google] userinfo failed', err)
    return fail('userinfo_failed')
  }

  const oauthTokensEnc = encrypt(tokens.refresh_token)

  await prisma.emailAccount.upsert({
    where: {
      userId_emailAddress: {
        userId: session.user.id,
        emailAddress: userInfo.email,
      },
    },
    update: {
      provider: 'gmail',
      displayName: userInfo.name,
      oauthTokensEnc,
      scopes,
      isActive: true,
    },
    create: {
      userId: session.user.id,
      provider: 'gmail',
      emailAddress: userInfo.email,
      displayName: userInfo.name,
      oauthTokensEnc,
      scopes,
      isActive: true,
    },
  })

  const success = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/automation/email-accounts?connected=${encodeURIComponent(userInfo.email)}`
  const res = NextResponse.redirect(success, 302)
  // Clear the state cookie.
  res.cookies.set(STATE_COOKIE, '', { path: '/api/email-accounts/oauth/google', maxAge: 0 })
  return res
}

function parseCookie(header: string, name: string): string | null {
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1))
    }
  }
  return null
}
