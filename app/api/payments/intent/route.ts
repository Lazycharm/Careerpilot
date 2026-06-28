/**
 * POST /api/payments/intent
 *
 * Body: { pricingCode: string, method: 'whatsapp' | 'ziina', metadata?: object }
 *
 * Creates a Payment row in the right initial status and returns the URL the
 * client should redirect to (wa.me deep-link for WhatsApp, Ziina's
 * redirect_url for the Ziina rail).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { createPayment, PaymentError } from '@/lib/payments/router'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  pricingCode: z.string().min(1),
  method: z.enum(['whatsapp', 'ziina']),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success, reset } = await rateLimit('payments').limit(
      identifyRequest(req, session.user.id)
    )
    if (!success) return rateLimited(reset)

    const raw = await req.json().catch(() => ({}))
    const parsed = RequestSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const baseUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

    const result = await createPayment({
      userId: session.user.id,
      userName: session.user.name ?? 'Customer',
      pricingCode: parsed.data.pricingCode,
      method: parsed.data.method,
      successBaseUrl: `${baseUrl}/payments/success`,
      cancelBaseUrl: `${baseUrl}/payments/cancel`,
      metadata: parsed.data.metadata,
    })

    return NextResponse.json({
      paymentId: result.payment.id,
      method: result.payment.method,
      status: result.payment.status,
      redirectUrl: result.redirectUrl,
    })
  } catch (err) {
    if (err instanceof PaymentError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 400 }
      )
    }
    console.error('[payments.intent]', err)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
