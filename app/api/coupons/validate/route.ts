import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateCoupon } from '@/lib/coupons/validate'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  code: z.string().min(1),
  pricingCode: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = await req.json().catch(() => ({}))
  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const pricing = await prisma.pricing.findUnique({ where: { code: parsed.data.pricingCode } })
  if (!pricing || !pricing.isActive) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  const result = await validateCoupon(
    parsed.data.code,
    parsed.data.pricingCode,
    pricing.amountFils,
    session.user.id
  )

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 })
  }

  return NextResponse.json({ valid: true, coupon: result.coupon })
}
