import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await prisma.pricing.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        amountFils: true,
        currency: true,
        durationDays: true,
        isActive: true,
        features: true,
      },
    })
    return NextResponse.json(plans)
  } catch (err) {
    console.error('[api/pricing]', err)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}
