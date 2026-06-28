/**
 * Google OAuth 2.0 helper — used to grant CareerPilot the right to send mail
 * from a user's Gmail account on their behalf (Phase 6 automation).
 *
 * We deliberately request ONLY `gmail.send` — not read, not modify. The
 * narrowest scope minimises blast radius if a refresh token is exfiltrated
 * (which it shouldn't, since we encrypt it via lib/security/encryption.ts).
 *
 * No `googleapis` SDK — plain fetch keeps deploy lean.
 *
 * Docs: https://developers.google.com/identity/protocols/oauth2/web-server
 */

import { env } from '@/lib/env'

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const STANDARD_SCOPES = [
  GMAIL_SEND_SCOPE,
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

/** Build the URL we redirect the user to so they can grant consent. */
export function buildGoogleAuthorizationUrl(opts: {
  redirectUri: string
  state: string
  loginHint?: string
}): string {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_OAUTH_CLIENT_ID is not set')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: opts.redirectUri,
    response_type: 'code',
    scope: STANDARD_SCOPES.join(' '),
    access_type: 'offline', // required to receive a refresh_token
    prompt: 'consent', // force re-consent so we always get a fresh refresh token
    state: opts.state,
    include_granted_scopes: 'true',
  })
  if (opts.loginHint) params.set('login_hint', opts.loginHint)
  return `${AUTH_URL}?${params.toString()}`
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
  id_token?: string
}

/** Exchange an authorization code for tokens. */
export async function exchangeGoogleCode(opts: {
  code: string
  redirectUri: string
}): Promise<GoogleTokenResponse> {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET not set')
  }

  const body = new URLSearchParams({
    code: opts.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: opts.redirectUri,
    grant_type: 'authorization_code',
  })

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Google token exchange ${resp.status}: ${text.slice(0, 400)}`)
  }
  return (await resp.json()) as GoogleTokenResponse
}

/** Refresh an access token with a refresh token. */
export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
  scope?: string
}> {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET not set')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Google token refresh ${resp.status}: ${text.slice(0, 400)}`)
  }
  return (await resp.json()) as {
    access_token: string
    expires_in: number
    scope?: string
  }
}

/** Fetch the connected account's email + display name. */
export async function fetchGoogleUserInfo(accessToken: string): Promise<{
  email: string
  name?: string
  picture?: string
}> {
  const resp = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!resp.ok) throw new Error(`Google userinfo ${resp.status}`)
  return (await resp.json()) as { email: string; name?: string; picture?: string }
}
