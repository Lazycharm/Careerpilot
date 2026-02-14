import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { PlanType } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sub = await prisma.subscription.findFirst({
      where: { userId: params.id },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(sub)
  } catch (error) {
    console.error('Admin get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planType, extendMonths } = body as { planType?: PlanType; extendMonths?: number }

    if (!planType || !['free', 'pay_per_download', 'pro', 'business'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid planType' }, { status: 400 })
    }

    const existing = await prisma.subscription.findFirst({
      where: { userId: params.id },
      orderBy: { updatedAt: 'desc' },
    })

    const now = new Date()
    let currentPeriodEnd = now
    if (extendMonths && extendMonths > 0) {
      currentPeriodEnd = new Date(now)
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + extendMonths)
    } else if (existing?.currentPeriodEnd && existing.currentPeriodEnd > now) {
      currentPeriodEnd = existing.currentPeriodEnd
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
    }

    if (existing) {
      const updated = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planType,
          status: planType === 'free' ? 'expired' : 'active',
          currentPeriodStart: now,
          currentPeriodEnd: planType === 'free' ? now : currentPeriodEnd,
        },
      })
      return NextResponse.json(updated)
    }

    const created = await prisma.subscription.create({
      data: {
        userId: params.id,
        status: planType === 'free' ? 'expired' : 'active',
        planType,
        currentPeriodStart: now,
        currentPeriodEnd: planType === 'free' ? now : currentPeriodEnd,
      },
    })
    return NextResponse.json(created)
  } catch (error) {
    console.error('Admin override subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
