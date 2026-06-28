/**
 * GET /api/admin/audit-logs
 *
 * Paginated audit log viewer. Filterable by action prefix, actor, target,
 * and a date range. Returns 50 rows per page by default.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action') ?? ''
  const actorId = url.searchParams.get('actorId') ?? ''
  const target = url.searchParams.get('target') ?? ''
  const since = url.searchParams.get('since') ?? ''
  const until = url.searchParams.get('until') ?? ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? '50') || 50))

  const where: Prisma.AuditLogWhereInput = {}
  if (action.trim()) where.action = { startsWith: action.trim() }
  if (actorId.trim()) where.actorId = actorId.trim()
  if (target.trim()) where.target = target.trim()
  if (since.trim() || until.trim()) {
    where.createdAt = {}
    if (since.trim()) (where.createdAt as any).gte = new Date(since.trim())
    if (until.trim()) (where.createdAt as any).lte = new Date(until.trim())
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ items, page, pageSize, total })
}
