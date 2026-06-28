/**
 * POST /api/payments/webhook  (Ziina)
 *
 * Phase 3 rewrite.
 *
 * Defensive controls:
 *   1. IP allowlist — only the 4 Ziina source IPs documented at
 *      https://docs.ziina.com/api-reference/webhook/index are accepted.
 *      Anything else returns 403 without touching the body.
 *   2. HMAC verification — the raw request body is HMAC-SHA256'd with the
 *      configured webhook secret and compared to `X-Hmac-Signature` in
 *      constant time.
 *   3. Idempotency — `markZiinaCompleted` is a no-op if the Payment is
 *      already in `approved` state. Ziina retries up to 3 times on non-2xx.
 *
 * The route only updates the Payment row. Subscription activation is the
 * caller's concern (Phase 4 will pair this with subscription provisioning
 * once the Pricing-driven sub flow lands).
 *
 * Legacy behavior preserved: a no-op happens cleanly if the webhook fires
 * for an intent we don't know about — useful during migration.
 */

import { NextResponse } from 'next/server'
import {
  isZiinaWebhookIP,
  verifyZiinaSignature,
  type ZiinaWebhookEvent,
} from '@/lib/payments/ziina'
import { markZiinaCompleted, markZiinaFailed } from '@/lib/payments/router'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // 1. IP allowlist
  const ip = pickClientIp(req)
  if (!isZiinaWebhookIP(ip)) {
    console.warn('[ziina.webhook] rejected ip', ip)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Read raw body — required for HMAC; never call req.json() first.
  const rawBody = await req.text()
  const signature = req.headers.get('x-hmac-signature')

  // Signature is required in any environment where the secret is configured.
  // We refuse outright if the secret isn't configured — silent passthrough
  // would let an attacker simply omit the header.
  if (!verifyZiinaSignature({ rawBody, signatureHeader: signature })) {
    console.warn('[ziina.webhook] invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Process
  let event: ZiinaWebhookEvent
  try {
    event = JSON.parse(rawBody) as ZiinaWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  try {
    if (event.event === 'payment_intent.status.updated' && event.data?.id) {
      const intentId = event.data.id
      switch (event.data.status) {
        case 'completed': {
          const updated = await markZiinaCompleted(intentId)
          // Activate / extend subscription mirroring the legacy 1-year window,
          // until Phase 4 rebuilds subscription provisioning around Pricing.
          if (updated && updated.userId) {
            await provisionLegacySubscription(updated.userId, updated.id, intentId)
          }
          break
        }
        case 'failed':
          await markZiinaFailed(intentId, 'Ziina reported failed')
          break
        // pending / requires_payment_instrument / requires_user_action — no-op.
      }
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[ziina.webhook] handler error', err)
    // 5xx prompts Ziina to retry; this is safe because handlers are idempotent.
    return NextResponse.json({ error: 'handler_error' }, { status: 500 })
  }
}

/**
 * Bridge to the legacy `Subscription` model so paid users can keep using the
 * app while Phase 4 rebuilds the Pricing-driven subscription flow.
 */
async function provisionLegacySubscription(
  userId: string,
  _paymentId: string,
  intentId: string
) {
  const existing = await prisma.subscription.findFirst({
    where: { ziinaOrderId: intentId },
  })
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'active',
        startDate: existing.startDate ?? new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
    return
  }
  await prisma.subscription.create({
    data: {
      userId,
      status: 'active',
      planType: 'pro', // closest existing enum to "paid"
      ziinaOrderId: intentId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })
}

function pickClientIp(req: Request): string | null {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return null
}
