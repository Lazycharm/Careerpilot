import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeNextRunAt } from '@/lib/automation/scheduler'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { status: newStatus } = body

  if (!['active', 'paused'].includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const automation = await prisma.automation.findUnique({ where: { id: params.id } })
  if (!automation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.automation.update({
    where: { id: params.id },
    data: {
      status: newStatus,
      nextRunAt: newStatus === 'active'
        ? computeNextRunAt(new Date(), automation.schedule as any)
        : null,
    },
  })

  return NextResponse.json(updated)
}
