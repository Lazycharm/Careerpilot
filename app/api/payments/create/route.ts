/**
 * SUNSET — replaced in Phase 3 by /api/payments/intent.
 *
 * This endpoint used the legacy `lib/ziina.ts` client (no HMAC verification,
 * no IP allowlist, no dual-rail support). It has been retired in favour of
 * `POST /api/payments/intent` which routes WhatsApp + Ziina through
 * `lib/payments/router.ts` with full security controls.
 *
 * Returning 410 Gone here so any old client / external integration gets a
 * clear error instead of silently hitting nothing.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been retired.',
      replacement: '/api/payments/intent',
      docs: 'Body: { pricingCode, method: "whatsapp" | "ziina", metadata? }',
    },
    { status: 410 }
  )
}
