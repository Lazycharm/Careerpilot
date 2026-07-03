/**
 * Payment router — turns "user picked a plan with method X" into a Payment row
 * plus the right next-step URL (WhatsApp deep link or Ziina redirect).
 *
 * This module is the single source of truth for:
 *   - Which payment methods are currently enabled (admin toggle aware).
 *   - How to mint a Payment row for each rail.
 *   - Where to send the user after creation.
 *
 * API routes call `createPayment(...)`; webhooks and admin approve/reject
 * flows call into helpers on the same module so transition logic stays in
 * one place.
 */

import { prisma } from '@/lib/prisma'
import type { Payment, PaymentMethod, Pricing } from '@prisma/client'
import {
  buildWhatsAppUrl,
  filsToAED,
  loadTemplateBody,
  renderTemplate,
} from './whatsapp'
import { createZiinaIntent } from './ziina'
import { env } from '@/lib/env'
import { getPaymentSettings } from './settings'
import { validateCoupon } from '@/lib/coupons/validate'

/** Methods currently enabled for the user. Empty array → checkout disabled. */
export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  const s = await getPaymentSettings()
  const out: PaymentMethod[] = []
  if (s.whatsapp.enabled && s.whatsapp.adminNumber) out.push('whatsapp')
  if (s.ziina.enabled && env.ZIINA_API_KEY) out.push('ziina')
  return out
}

export interface CreatePaymentInput {
  userId: string
  userName: string
  pricingCode: string
  method: PaymentMethod
  /** Where the user should land after Ziina success — caller supplies base URL. */
  successBaseUrl: string
  cancelBaseUrl: string
  /** Optional coupon code to apply. */
  couponCode?: string
  /** Optional arbitrary context (resumeId, coverLetterId, etc.). */
  metadata?: Record<string, unknown>
}

export interface CreatePaymentResult {
  payment: Payment
  /** Where to send the user. wa.me link or Ziina redirect_url. */
  redirectUrl: string
}

export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  const pricing = await prisma.pricing.findUnique({ where: { code: input.pricingCode } })
  if (!pricing || !pricing.isActive) {
    throw new PaymentError('Unknown or inactive plan', 'invalid_plan')
  }
  if (pricing.amountFils <= 0) {
    throw new PaymentError('This plan is free — no payment required', 'free_plan')
  }

  // Resolve coupon discount
  let couponId: string | undefined
  let discountFils = 0
  let finalAmountFils = pricing.amountFils

  if (input.couponCode) {
    const couponResult = await validateCoupon(
      input.couponCode,
      input.pricingCode,
      pricing.amountFils,
      input.userId
    )
    if (!couponResult.valid || !couponResult.coupon) {
      throw new PaymentError(couponResult.error ?? 'Invalid coupon', 'invalid_coupon')
    }
    couponId = couponResult.coupon.id
    discountFils = couponResult.coupon.discountFils
    finalAmountFils = couponResult.coupon.finalAmountFils
  }

  const settings = await getPaymentSettings()

  if (input.method === 'whatsapp') {
    if (!settings.whatsapp.enabled) {
      throw new PaymentError('WhatsApp payments are disabled', 'method_disabled')
    }
    if (!settings.whatsapp.adminNumber) {
      throw new PaymentError('Admin WhatsApp number is not configured', 'method_misconfigured')
    }
    return await createWhatsAppPayment(input, pricing, settings.whatsapp, { couponId, discountFils, finalAmountFils })
  }

  if (input.method === 'ziina') {
    if (!settings.ziina.enabled) {
      throw new PaymentError('Ziina payments are disabled', 'method_disabled')
    }
    return await createZiinaPayment(input, pricing, settings.ziina.testMode, { couponId, discountFils, finalAmountFils })
  }

  throw new PaymentError('Unsupported method', 'unsupported_method')
}

// ─── WhatsApp rail ──────────────────────────────────────────────────────────

type CouponContext = { couponId?: string; discountFils: number; finalAmountFils: number }

async function createWhatsAppPayment(
  input: CreatePaymentInput,
  pricing: Pricing,
  cfg: { enabled: boolean; adminNumber: string | null; requestTemplateCode: string },
  coupon: CouponContext
): Promise<CreatePaymentResult> {
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      pricingId: pricing.id,
      method: 'whatsapp',
      status: 'pending_whatsapp',
      amountFils: coupon.finalAmountFils,
      discountFils: coupon.discountFils,
      currency: pricing.currency,
      couponId: coupon.couponId ?? null,
      metadata: input.metadata as any,
    },
  })

  // Render the configured template; fall back to a sane default if admin
  // hasn't seeded one yet.
  const tplBody =
    (await loadTemplateBody(cfg.requestTemplateCode)) ??
    'Hi, I would like to pay {{amountAED}} AED for {{planName}} on CareerPilot. ' +
      'Payment reference: {{paymentId}}. Please send payment instructions. Thank you!'

  const merged = renderTemplate(tplBody, {
    userName: input.userName,
    planName: pricing.name,
    amountAED: filsToAED(coupon.finalAmountFils),
    paymentId: payment.id,
  })

  const whatsappUrl = buildWhatsAppUrl(cfg.adminNumber!, merged)

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      whatsappRequestText: merged,
      whatsappUrl,
    },
  })

  await recordCouponUsage(coupon.couponId, input.userId, updated.id)
  return { payment: updated, redirectUrl: whatsappUrl }
}

// ─── Ziina rail ─────────────────────────────────────────────────────────────

async function createZiinaPayment(
  input: CreatePaymentInput,
  pricing: Pricing,
  testMode: boolean,
  coupon: CouponContext
): Promise<CreatePaymentResult> {
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      pricingId: pricing.id,
      method: 'ziina',
      status: 'pending_ziina',
      amountFils: coupon.finalAmountFils,
      discountFils: coupon.discountFils,
      currency: pricing.currency,
      couponId: coupon.couponId ?? null,
      metadata: input.metadata as any,
    },
  })

  const intent = await createZiinaIntent({
    amountFils: coupon.finalAmountFils,
    currency: pricing.currency,
    description: `CareerPilot — ${pricing.name}`,
    successUrl: `${input.successBaseUrl}?paymentId=${payment.id}&intentId={PAYMENT_INTENT_ID}`,
    cancelUrl: `${input.cancelBaseUrl}?paymentId=${payment.id}`,
    test: testMode,
    metadata: {
      paymentId: payment.id,
      userId: input.userId,
      pricingCode: pricing.code,
      ...(input.metadata ?? {}),
    },
  })

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      ziinaIntentId: intent.id,
      ziinaRedirectUrl: intent.redirectUrl,
    },
  })

  await recordCouponUsage(coupon.couponId, input.userId, updated.id)
  return { payment: updated, redirectUrl: intent.redirectUrl }
}

// ─── Coupon usage recording ─────────────────────────────────────────────────

async function recordCouponUsage(couponId: string | undefined, userId: string, paymentId: string) {
  if (!couponId) return
  await prisma.$transaction([
    prisma.couponUsage.create({ data: { couponId, userId, paymentId } }),
    prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }),
  ])
}

// ─── State transitions (called by admin route + webhook) ───────────────────

export async function approvePayment(opts: {
  paymentId: string
  approverId: string
  note?: string
}): Promise<Payment> {
  return prisma.payment.update({
    where: { id: opts.paymentId },
    data: {
      status: 'approved',
      approvedById: opts.approverId,
      approvedAt: new Date(),
      adminNote: opts.note,
    },
  })
}

export async function rejectPayment(opts: {
  paymentId: string
  reason: string
}): Promise<Payment> {
  return prisma.payment.update({
    where: { id: opts.paymentId },
    data: {
      status: 'rejected',
      rejectedReason: opts.reason,
      rejectedAt: new Date(),
    },
  })
}

/** Idempotent mark-completed for the Ziina webhook handler. */
export async function markZiinaCompleted(intentId: string): Promise<Payment | null> {
  const payment = await prisma.payment.findUnique({ where: { ziinaIntentId: intentId } })
  if (!payment) return null
  if (payment.status === 'approved') return payment
  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'approved',
      approvedAt: new Date(),
    },
  })
}

export async function markZiinaFailed(intentId: string, reason: string): Promise<Payment | null> {
  const payment = await prisma.payment.findUnique({ where: { ziinaIntentId: intentId } })
  if (!payment) return null
  if (payment.status === 'failed' || payment.status === 'rejected') return payment
  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'failed', rejectedReason: reason, rejectedAt: new Date() },
  })
}

// ─── Errors ────────────────────────────────────────────────────────────────

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'invalid_plan'
      | 'free_plan'
      | 'method_disabled'
      | 'method_misconfigured'
      | 'unsupported_method'
      | 'invalid_coupon'
  ) {
    super(message)
    this.name = 'PaymentError'
  }
}
