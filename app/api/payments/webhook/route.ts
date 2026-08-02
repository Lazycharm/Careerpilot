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
 * Subscription activation happens inside `markZiinaCompleted()` itself
 * (`lib/payments/router.ts`) — shared with the WhatsApp admin-approve rail
 * so both paths can't drift again.
 *
 * Legacy behavior preserved: a no-op happens cleanly if the webhook fires
 * for an intent we don't know about — useful during migration.
 *
 * Shared-webhook fan-out (2026-08-02): Ziina only allows ONE registered
 * webhook URL per merchant account, and every AyoubOS product that takes
 * Ziina payments (CareerPilot, Invoice, CashLink, SoftPoint) uses this same
 * account/API key — registering a second webhook would silently overwrite
 * this one. Ayoub's real decision: keep this URL as the single registered
 * endpoint, and have it forward the untouched raw body + the already-
 * verified signature on to each other product's own existing ziina-webhook
 * function, which independently re-verifies the signature (same shared
 * secret) and looks up the intent id in its own database, no-op'ing
 * cleanly if it's not theirs. This route's own handling of the event
 * (below) is unaffected — CareerPilot's own logic still runs exactly as
 * before, fan-out is additive.
 */

import { NextResponse } from 'next/server'
import {
  isZiinaWebhookIP,
  verifyZiinaSignature,
  type ZiinaWebhookEvent,
} from '@/lib/payments/ziina'
import { markZiinaCompleted, markZiinaFailed } from '@/lib/payments/router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Other products sharing this Ziina account's single webhook. Each of
// these already has its own real ziina-webhook Edge Function (built and
// verified independently) - this only forwards the raw event to it.
const FAN_OUT_URLS = [
  'https://azddjridufxqbqvhvpxq.supabase.co/functions/v1/ziina-webhook', // Invoice
  'https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/ziina-webhook', // CashLink
  'https://ggdrywyprcrhygxiaeny.supabase.co/functions/v1/ziina-webhook', // SoftPoint
]

function forwardToOtherProducts(rawBody: string, signature: string | null) {
  if (!signature) return
  // No IP-allowlist-bypass header here on purpose - that would just be a
  // spoofable claim. The real authentication is the HMAC signature itself
  // (only forwarded unchanged, never regenerated), which each downstream
  // function independently re-verifies against the same shared secret.
  // Their IP allowlist has been relaxed to not block this forward (see
  // each product's ziina-webhook/index.ts) - signature verification is
  // the actual security boundary now, the IP check was defense-in-depth
  // that would otherwise reject a legitimate forward from Vercel's egress
  // IP outright.
  for (const url of FAN_OUT_URLS) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hmac-Signature': signature,
      },
      body: rawBody,
    }).catch((err) => {
      console.error('[ziina.webhook] fan-out failed for', url, err);
    });
  }
}

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

  // 3. Fan out to the other products sharing this account's single webhook
  // (see the file-level comment above) - fire-and-forget, doesn't block or
  // affect this route's own handling below.
  forwardToOtherProducts(rawBody, signature)

  // 4. Process
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
          // markZiinaCompleted() activates/extends the subscription itself.
          await markZiinaCompleted(intentId)
          break
        }
        case 'failed':
          await markZiinaFailed(intentId, 'Ziina reported failed')
          break
        case 'canceled':
          await markZiinaFailed(intentId, 'Ziina reported canceled by user')
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

function pickClientIp(req: Request): string | null {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return null
}
