/**
 * SUNSET — webhook registration is now a one-time manual setup.
 *
 * Register the Ziina webhook directly from the Ziina dashboard (or via curl)
 * pointing at /api/payments/webhook with the secret you store in
 * ZIINA_WEBHOOK_SECRET. See lib/payments/ziina.ts for details.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been retired.',
      instructions:
        'Register the webhook in the Ziina dashboard. URL: https://<your-domain>/api/payments/webhook. Secret: set ZIINA_WEBHOOK_SECRET in env.',
      docs: 'https://docs.ziina.com/api-reference/webhook/index',
    },
    { status: 410 }
  )
}
