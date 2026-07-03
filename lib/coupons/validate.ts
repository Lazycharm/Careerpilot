import { prisma } from '@/lib/prisma'

export interface CouponValidationResult {
  valid: boolean
  error?: string
  coupon?: {
    id: string
    code: string
    description: string | null
    discountType: string
    discountValue: number
    discountFils: number   // computed discount in fils for the given amount
    finalAmountFils: number
  }
}

export async function validateCoupon(
  code: string,
  pricingCode: string,
  amountFils: number,
  userId: string
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: 'Invalid or expired coupon code.' }
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'This coupon has expired.' }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit.' }
  }

  if (
    coupon.applicableTo.length > 0 &&
    !coupon.applicableTo.includes('all') &&
    !coupon.applicableTo.includes(pricingCode)
  ) {
    return { valid: false, error: 'This coupon is not valid for the selected plan.' }
  }

  if (coupon.minAmountFils !== null && amountFils < coupon.minAmountFils) {
    const minAED = (coupon.minAmountFils / 100).toFixed(2)
    return { valid: false, error: `Minimum order of AED ${minAED} required for this coupon.` }
  }

  // Check if user already used this coupon
  const existingUsage = await prisma.couponUsage.findFirst({
    where: { couponId: coupon.id, userId },
  })
  if (existingUsage) {
    return { valid: false, error: 'You have already used this coupon.' }
  }

  // Compute discount
  let discountFils = 0
  if (coupon.discountType === 'percent') {
    discountFils = Math.floor((amountFils * coupon.discountValue) / 100)
  } else {
    discountFils = Math.floor(coupon.discountValue)
  }
  discountFils = Math.min(discountFils, amountFils) // never exceed total

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountFils,
      finalAmountFils: amountFils - discountFils,
    },
  }
}
