/**
 * Resend client wrapper.
 *
 * Lean: uses fetch, no SDK dependency. Honors `RESEND_API_KEY` +
 * `RESEND_FROM_EMAIL`. Degrades gracefully — when Resend is not configured,
 * `sendEmail()` no-ops with a structured log so dev can call senders freely
 * without needing keys.
 *
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

import { env, features } from '@/lib/env'

export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface SendEmailResult {
  ok: boolean
  id?: string
  skipped?: boolean
  error?: string
}

const RESEND_URL = 'https://api.resend.com/emails'

/** Send a transactional email. Safe to call when Resend is not configured. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!features.resend || !env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    console.info(
      JSON.stringify({
        ts: new Date().toISOString(),
        kind: 'email_skipped',
        reason: 'resend_not_configured',
        to: input.to,
        subject: input.subject,
      })
    )
    return { ok: true, skipped: true }
  }

  try {
    const resp = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
        tags: input.tags,
      }),
    })
    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      return {
        ok: false,
        error: `Resend ${resp.status}: ${body.slice(0, 300)}`,
      }
    }
    const data = (await resp.json()) as { id?: string }
    return { ok: true, id: data.id }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
