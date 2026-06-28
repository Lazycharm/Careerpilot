/**
 * GET /api/payments/[id]
 *
 * Returns the status of a payment the caller owns. Used by the success page
 * to poll status until the webhook fires (Ziina rail) or the admin approves
 * (WhatsApp rail).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payment = await prisma.payment.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: {
      id: true,
      method: true,
      status: true,
      amountFils: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      approvedAt: true,
      rejectedReason: true,
      pricing: { select: { code: true, name: true } },
    },
  })

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }
  return NextResponse.json(payment)
}
