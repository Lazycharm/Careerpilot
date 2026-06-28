/**
 * POST /api/notifications/[id]/read → mark a single notification as read.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await prisma.notification.updateMany({
    where: { id: params.id, userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  })
  return NextResponse.json({ ok: true, marked: result.count })
}
