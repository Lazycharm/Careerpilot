/**
 * POST /api/admin/payments/[id]/approve
 *
 * Approves a pending payment. Activates a legacy Subscription so existing
 * gating works during Phase 4; the Pricing-driven subscription model lands
 * with the editor rewrite.
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
    include: { pricing: true },
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

  // Bridge to legacy Subscription so the rest of the app stays gated correctly.
  await provisionLegacySubscription({
    userId: before.userId,
    paymentId: before.id,
    durationDays: before.pricing.durationDays,
  })

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

async function provisionLegacySubscription(opts: {
  userId: string
  paymentId: string
  durationDays: number | null
}) {
  const now = new Date()
  // Bundles without a duration get a default 30-day window so the user has
  // entitlement to download / use AI; Phase 4 will replace this default with
  // per-bundle credit accounting.
  const days = opts.durationDays ?? 30
  const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const existing = await prisma.subscription.findFirst({
    where: { userId: opts.userId, status: 'active' },
    orderBy: { currentPeriodEnd: 'desc' },
  })

  if (existing) {
    // Extend: take the later of "existing end" and "now+days", to be generous.
    const newEnd =
      existing.currentPeriodEnd && existing.currentPeriodEnd > now
        ? new Date(existing.currentPeriodEnd.getTime() + days * 24 * 60 * 60 * 1000)
        : periodEnd
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'active',
        currentPeriodStart: existing.currentPeriodStart ?? now,
        currentPeriodEnd: newEnd,
        endDate: newEnd,
      },
    })
    return
  }

  await prisma.subscription.create({
    data: {
      userId: opts.userId,
      status: 'active',
      planType: 'pro',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      startDate: now,
      endDate: periodEnd,
    },
  })
}
