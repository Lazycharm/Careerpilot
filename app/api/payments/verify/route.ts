/**
 * SUNSET — replaced in Phase 3 by /api/payments/[id] + the proper Ziina webhook.
 *
 * The legacy verify endpoint hit Ziina's status API from the success page,
 * which races the webhook and produced inconsistent state. The correct flow:
 *   1. Ziina redirects user to /payments/success?paymentId=...&intentId=...
 *   2. Page polls GET /api/payments/[id] until status === 'approved'
 *   3. Approval is set by /api/payments/webhook (HMAC + IP-allowlisted)
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      error: 'This endpoint has been retired.',
      replacement: '/api/payments/[id]',
      note: 'Poll the payment status endpoint instead. The Ziina webhook handles approval.',
    },
    { status: 410 }
  )
}
