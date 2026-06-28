/**
 * GET /api/activity
 *
 * Caller's recent activity feed (50 newest events) decorated with a human
 * label. Used by the dashboard "Recent activity" widget.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { activityLabel, type ActivityEvent } from '@/lib/activity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      event: r.event,
      label: activityLabel(r.event as ActivityEvent) || r.event,
      meta: r.meta,
      createdAt: r.createdAt,
    })),
  })
}
