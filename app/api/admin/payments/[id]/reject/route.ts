/**
 * POST /api/admin/payments/[id]/reject
 *
 * Body: { reason: string }   // shown to user later in their payment history
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rejectPayment } from '@/lib/payments/router'
import { audit, auditContext } from '@/lib/security/audit'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { sendEmail } from '@/lib/email/resend'
import { paymentRejectedEmail } from '@/lib/email/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, reset } = await rateLimit('admin').limit(
    identifyRequest(req, session.user.id)
  )
  if (!success) return rateLimited(reset)

  const body = (await req.json().catch(() => ({}))) as { reason?: string }
  const reason = body.reason?.trim() ?? ''
  if (!reason) {
    return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
  }

  const before = await prisma.payment.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  if (before.status === 'rejected') {
    return NextResponse.json({ ok: true, payment: before, already: true })
  }

  const updated = await rejectPayment({ paymentId: before.id, reason })

  await audit({
    actorId: session.user.id,
    action: 'payment.reject',
    target: `payment:${before.id}`,
    before: { status: before.status },
    after: { status: updated.status, reason },
    ...auditContext(req),
  })

  notifyRejection({
    paymentId: before.id,
    userId: before.userId,
    reason,
  }).catch((err) => {
    console.error('[payment.reject] notify failed', err)
  })

  return NextResponse.json({ ok: true, payment: updated })
}

async function notifyRejection(opts: { paymentId: string; userId: string; reason: string }) {
  const payment = await prisma.payment.findUnique({
    where: { id: opts.paymentId },
    include: {
      user: { select: { email: true, name: true } },
      pricing: { select: { name: true } },
    },
  })
  if (!payment || !payment.user?.email) return

  const userName = payment.user.name ?? 'there'
  const planName = payment.pricing.name

  await prisma.notification.create({
    data: {
      userId: opts.userId,
      channel: 'in_app',
      title: `Payment could not be confirmed — ${planName}`,
      body: `Reason: ${opts.reason}`,
      href: '/subscription',
    },
  })

  const email = paymentRejectedEmail({ userName, planName, reason: opts.reason })
  await sendEmail({ to: payment.user.email, ...email })
}
