/**
 * Ziina client — Payment Intent + Webhook verification.
 *
 * Built against:
 *   https://docs.ziina.com/api-reference/payment-intent/index
 *   https://docs.ziina.com/api-reference/webhook/index
 *
 * Key facts the docs lock down (worth reading in code, not just the doc):
 *   - Amount is in fils. 5 AED = 500. Minimum payment is 200 (2 AED).
 *   - operation_id should be unique per request (idempotency).
 *   - success_url / cancel_url may include `{PAYMENT_INTENT_ID}` which Ziina
 *     replaces server-side with the intent id.
 *   - Webhook events: payment_intent.status.updated, refund.status.updated.
 *   - Webhook signature: X-Hmac-Signature = hex SHA-256 HMAC of the raw body
 *     using the secret you provided when registering the webhook.
 *   - Webhook IP allowlist: 3.29.184.186, 3.29.190.95, 20.233.47.127, 13.202.161.181.
 *
 * This module is deliberately UI-agnostic — it returns plain objects. The
 * /api/payments/* routes own the persistence and HTTP layer.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { randomUUID } from 'node:crypto'
import { env } from '@/lib/env'

const ZIINA_BASE = 'https://api-v2.ziina.com'

/** IPs from which Ziina delivers webhooks. Any other source must be rejected. */
export const ZIINA_WEBHOOK_IPS = [
  '3.29.184.186',
  '3.29.190.95',
  '20.233.47.127',
  '13.202.161.181',
] as const

export type ZiinaStatus =
  | 'requires_payment_instrument'
  | 'pending'
  | 'requires_user_action'
  | 'completed'
  | 'failed'

export interface CreateIntentInput {
  /** Amount in fils. Must be >= 200 (2 AED). */
  amountFils: number
  currency?: string // default AED
  /** Shown on the payment page (Ziina's "message"). */
  description?: string
  /** Where Ziina redirects on success. Use `{PAYMENT_INTENT_ID}` to receive the id back. */
  successUrl: string
  cancelUrl: string
  failureUrl?: string
  /** True forces Ziina test mode — no money moves. */
  test?: boolean
  /** Arbitrary metadata persisted by Ziina and returned on fetch. */
  metadata?: Record<string, unknown>
}

export interface CreatedIntent {
  id: string
  redirectUrl: string
  status: ZiinaStatus
  raw: unknown
}

/**
 * Create a Payment Intent.
 *
 * @throws if ZIINA_API_KEY is unset, if amount is below Ziina's minimum,
 *         or if the upstream call fails (the upstream body is included in
 *         the error message for debuggability).
 */
export async function createZiinaIntent(input: CreateIntentInput): Promise<CreatedIntent> {
  const apiKey = env.ZIINA_API_KEY
  if (!apiKey) throw new Error('ZIINA_API_KEY is not set')
  if (input.amountFils < 200) {
    throw new Error(`Ziina minimum amount is 200 fils (2 AED); got ${input.amountFils}`)
  }

  const body = {
    amount: input.amountFils,
    currency_code: input.currency ?? 'AED',
    message: input.description,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    failure_url: input.failureUrl,
    test: input.test ?? env.ZIINA_TEST_MODE,
    operation_id: randomUUID(),
    metadata: input.metadata,
  }

  const resp = await fetch(`${ZIINA_BASE}/api/payment_intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Ziina createIntent ${resp.status}: ${text.slice(0, 500)}`)
  }

  const data = (await resp.json()) as {
    id: string
    redirect_url: string
    status: ZiinaStatus
  }

  return {
    id: data.id,
    redirectUrl: data.redirect_url,
    status: data.status,
    raw: data,
  }
}

export interface FetchedIntent {
  id: string
  status: ZiinaStatus
  raw: unknown
}

export async function getZiinaIntent(id: string): Promise<FetchedIntent> {
  const apiKey = env.ZIINA_API_KEY
  if (!apiKey) throw new Error('ZIINA_API_KEY is not set')

  const resp = await fetch(`${ZIINA_BASE}/api/payment_intent/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Ziina getIntent ${resp.status}: ${text.slice(0, 500)}`)
  }
  const data = (await resp.json()) as { id: string; status: ZiinaStatus }
  return { id: data.id, status: data.status, raw: data }
}

/**
 * Verify a Ziina webhook signature.
 *
 * Pass the RAW request body (the string Ziina sent, BEFORE JSON.parse) and
 * the value of the `X-Hmac-Signature` header. The secret is whatever you
 * registered with Ziina (we read ZIINA_WEBHOOK_SECRET unless overridden).
 *
 * Uses constant-time comparison to defend against timing oracles.
 */
export function verifyZiinaSignature(opts: {
  rawBody: string
  signatureHeader: string | null | undefined
  secret?: string
}): boolean {
  const secret = opts.secret ?? env.ZIINA_WEBHOOK_SECRET
  if (!secret) return false
  if (!opts.signatureHeader) return false

  const expected = createHmac('sha256', secret).update(opts.rawBody).digest('hex')

  // Both must be the same byte-length for timingSafeEqual; fail fast if not.
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(opts.signatureHeader.trim(), 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * IP allowlist check. Pass the source IP for the webhook request.
 *
 * Cloudflare/Vercel forward the client IP via `cf-connecting-ip`,
 * `x-real-ip`, or the first entry of `x-forwarded-for`. Caller is
 * responsible for picking the right header.
 */
export function isZiinaWebhookIP(ip: string | null | undefined): boolean {
  if (!ip) return false
  return (ZIINA_WEBHOOK_IPS as readonly string[]).includes(ip.trim())
}

/** Webhook payload envelope per Ziina docs. */
export interface ZiinaWebhookEvent {
  event: 'payment_intent.status.updated' | 'refund.status.updated' | string
  data: {
    id?: string
    status?: ZiinaStatus
    [key: string]: unknown
  }
}
