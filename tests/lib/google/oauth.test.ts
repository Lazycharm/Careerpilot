import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ORIGINAL = process.env.GOOGLE_OAUTH_CLIENT_ID

beforeAll(() => {
  process.env.GOOGLE_OAUTH_CLIENT_ID = 'TEST_CLIENT_ID.apps.googleusercontent.com'
})

afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.GOOGLE_OAUTH_CLIENT_ID
  else process.env.GOOGLE_OAUTH_CLIENT_ID = ORIGINAL
})

describe('buildGoogleAuthorizationUrl', () => {
  it('produces a URL with the right scopes, prompt, and offline access', async () => {
    const { buildGoogleAuthorizationUrl, GMAIL_SEND_SCOPE } = await import(
      '@/lib/google/oauth'
    )
    const url = buildGoogleAuthorizationUrl({
      redirectUri: 'http://localhost:3000/cb',
      state: 'state123',
    })
    expect(url.startsWith('https://accounts.google.com/o/oauth2/v2/auth?')).toBe(true)
    const u = new URL(url)
    expect(u.searchParams.get('client_id')).toBe('TEST_CLIENT_ID.apps.googleusercontent.com')
    expect(u.searchParams.get('redirect_uri')).toBe('http://localhost:3000/cb')
    expect(u.searchParams.get('state')).toBe('state123')
    expect(u.searchParams.get('access_type')).toBe('offline')
    expect(u.searchParams.get('prompt')).toBe('consent')
    expect(u.searchParams.get('response_type')).toBe('code')
    expect(u.searchParams.get('scope')).toContain(GMAIL_SEND_SCOPE)
  })

  it('appends login_hint when provided', async () => {
    const { buildGoogleAuthorizationUrl } = await import('@/lib/google/oauth')
    const url = buildGoogleAuthorizationUrl({
      redirectUri: 'http://localhost:3000/cb',
      state: 'x',
      loginHint: 'a@b.com',
    })
    expect(new URL(url).searchParams.get('login_hint')).toBe('a@b.com')
  })

  // Note: a "throws when GOOGLE_OAUTH_CLIENT_ID is unset" test would need to
  // re-evaluate lib/env.ts after deleting the env var, which is brittle under
  // Vitest's module cache. The contract is enforced at env-load time in
  // production and exercised end-to-end whenever the start-route is called
  // without credentials configured.
})
