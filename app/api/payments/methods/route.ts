/**
 * GET /api/payments/methods
 *
 * Returns the payment methods currently enabled by admin settings.
 * The checkout UI uses this to decide which buttons to render.
 *
 * Shape: { methods: PaymentMethod[] }
 * Empty array means payments are temporarily disabled — UI should show a
 * graceful banner; existing approved subscriptions are unaffected.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEnabledPaymentMethods } from '@/lib/payments/router'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, reset } = await rateLimit('public').limit(
    identifyRequest(req, session.user.id)
  )
  if (!success) return rateLimited(reset)

  const methods = await getEnabledPaymentMethods()
  return NextResponse.json({ methods })
}
