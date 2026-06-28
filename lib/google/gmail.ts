/**
 * Gmail Send helper.
 *
 * Builds an RFC-822 message and POSTs it to the Gmail Send endpoint as a
 * raw base64url-encoded blob. Plain fetch — no googleapis SDK.
 *
 * Token strategy: the caller passes in the user's encrypted refresh token,
 * we refresh-to-access-token on demand, then send. We do NOT store access
 * tokens; they live only in memory for one send.
 *
 * Docs: https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send
 */

import { decrypt } from '@/lib/security/encryption'
import { refreshGoogleAccessToken } from './oauth'

const SEND_URL =
  'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

export interface GmailSendInput {
  /** Encrypted refresh token blob (EmailAccount.oauthTokensEnc). */
  encryptedRefreshToken: string
  /** Sender display info — what the recipient sees in From: line. */
  from: { name?: string; email: string }
  to: string
  subject: string
  bodyHtml: string
  bodyText?: string
}

export interface GmailSendResult {
  messageId: string
  threadId: string
}

export async function gmailSend(input: GmailSendInput): Promise<GmailSendResult> {
  const refreshToken = decrypt(input.encryptedRefreshToken)
  const { access_token } = await refreshGoogleAccessToken(refreshToken)

  const fromHeader = input.from.name
    ? `${quoteIfNeeded(input.from.name)} <${input.from.email}>`
    : input.from.email

  const rfc822 = buildMultipartMime({
    from: fromHeader,
    to: input.to,
    subject: input.subject,
    bodyHtml: input.bodyHtml,
    bodyText: input.bodyText ?? htmlToText(input.bodyHtml),
  })
  const raw = base64UrlEncode(rfc822)

  const resp = await fetch(SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ raw }),
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Gmail send ${resp.status}: ${text.slice(0, 400)}`)
  }
  const data = (await resp.json()) as { id: string; threadId: string }
  return { messageId: data.id, threadId: data.threadId }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function quoteIfNeeded(name: string): string {
  // RFC 2822 — if the display name contains anything funny, wrap in quotes.
  if (/[,;:<>@"\\()[\].]/.test(name)) return `"${name.replace(/"/g, '\\"')}"`
  return name
}

function buildMultipartMime(opts: {
  from: string
  to: string
  subject: string
  bodyHtml: string
  bodyText: string
}): string {
  const boundary = `=_cp_${Date.now().toString(36)}`
  const enc = (s: string) =>
    // RFC 2047 encode the subject to handle non-ASCII safely.
    `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`

  return [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${enc(opts.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    opts.bodyText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    opts.bodyHtml,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
