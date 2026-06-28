/**
 * GET /api/email-accounts/oauth/google/start
 *
 * Kicks off the Gmail OAuth dance. Returns a 302 redirect to Google's
 * consent screen carrying a CSRF `state` token, which we stash in a
 * short-lived HttpOnly cookie and re-verify on the callback.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomBytes } from 'node:crypto'
import { authOptions } from '@/lib/auth'
import { buildGoogleAuthorizationUrl } from '@/lib/google/oauth'
import { env, features } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATE_COOKIE = 'cp_g_oauth_state'
const STATE_TTL_SEC = 600 // 10 minutes

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!features.googleOAuth) {
    return NextResponse.json(
      { error: 'Google OAuth not configured (set GOOGLE_OAUTH_CLIENT_ID + SECRET)' },
      { status: 503 }
    )
  }

  // Generate a CSRF token bound to the user so the callback can verify the
  // round-trip wasn't initiated by an attacker who got the user to click a
  // crafted link.
  const state = `${session.user.id}.${randomBytes(24).toString('base64url')}`
  const redirectUri = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/api/email-accounts/oauth/google/callback`
  const url = buildGoogleAuthorizationUrl({
    redirectUri,
    state,
    loginHint: req.headers.get('x-prefill-email') ?? undefined,
  })

  const res = NextResponse.redirect(url, 302)
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/api/email-accounts/oauth/google',
    maxAge: STATE_TTL_SEC,
  })
  return res
}
