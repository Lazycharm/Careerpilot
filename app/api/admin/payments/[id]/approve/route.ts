/**
 * POST /api/admin/payments/[id]/approve
 *
 * Approves a pending WhatsApp-rail payment. Subscription activation (setting
 * pricingId, currentPeriodStart/End) happens inside `approvePayment()` in
 * `lib/payments/router.ts` — shared with the Ziina webhook rail.
 *
 * Body (optional): { note?: string }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { approvePayment } from '@/lib/payments/router'
import { audit, auditContext } from '@/lib/security/audit'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { sendEmail } from '@/lib/email/resend'
import { paymentApprovedEmail } from '@/lib/email/templates'
import { filsToAED } from '@/lib/payments/whatsapp'

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

  const body = (await req.json().catch(() => ({}))) as { note?: string }

  const before = await prisma.payment.findUnique({
    where: { id: params.id },
  })
  if (!before) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }
  if (before.status === 'approved') {
    return NextResponse.json({ ok: true, payment: before, already: true })
  }

  const updated = await approvePayment({
    paymentId: before.id,
    approverId: session.user.id,
    note: body.note,
  })
  // Subscription activation now happens inside approvePayment() itself
  // (lib/payments/router.ts) — shared with the Ziina webhook rail so both
  // paths can't drift again.

  await audit({
    actorId: session.user.id,
    action: 'payment.approve',
    target: `payment:${before.id}`,
    before: { status: before.status },
    after: { status: updated.status, note: body.note ?? null },
    ...auditContext(req),
  })

  // Best-effort: notify the user via in-app + email. Failures are logged but
  // never bubble up — the approval action itself succeeded.
  notifyApproval({ paymentId: before.id, userId: before.userId }).catch((err) => {
    console.error('[payment.approve] notify failed', err)
  })

  return NextResponse.json({ ok: true, payment: updated })
}

async function notifyApproval(opts: { paymentId: string; userId: string }) {
  const payment = await prisma.payment.findUnique({
    where: { id: opts.paymentId },
    include: {
      user: { select: { email: true, name: true } },
      pricing: { select: { name: true, durationDays: true } },
    },
  })
  if (!payment || !payment.user?.email) return

  // Resolve the user's current subscription end so the email can show it.
  const sub = await prisma.subscription.findFirst({
    where: { userId: opts.userId, status: 'active' },
    orderBy: { currentPeriodEnd: 'desc' },
    select: { currentPeriodEnd: true },
  })

  const userName = payment.user.name ?? 'there'
  const planName = payment.pricing.name
  const amountAED = filsToAED(payment.amountFils)

  await prisma.notification.create({
    data: {
      userId: opts.userId,
      channel: 'in_app',
      title: `Payment confirmed — ${planName}`,
      body: `Your payment of ${amountAED} AED was confirmed. Your ${planName} access is now active.`,
      href: '/dashboard',
    },
  })

  const email = paymentApprovedEmail({
    userName,
    planName,
    amountAED,
    periodEndIso: sub?.currentPeriodEnd?.toISOString() ?? null,
  })
  await sendEmail({ to: payment.user.email, ...email })
}
