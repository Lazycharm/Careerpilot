/**
 * GET /api/admin/payments
 *
 * Returns the payment queue for admin review. Filterable by status, method,
 * and user. Paginated.
 *
 * Query:
 *   status=pending_whatsapp|pending_ziina|approved|rejected|failed|all
 *   method=whatsapp|ziina|all
 *   q=<user-name-or-email-substring>
 *   page=1, pageSize=20
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { Prisma, type PaymentMethod, type PaymentStatus } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUSES: PaymentStatus[] = [
  'created',
  'pending_whatsapp',
  'pending_ziina',
  'approved',
  'rejected',
  'failed',
  'refunded',
]
const METHODS: PaymentMethod[] = ['whatsapp', 'ziina', 'manual_other']

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, reset } = await rateLimit('admin').limit(
    identifyRequest(req, session.user.id)
  )
  if (!success) return rateLimited(reset)

  const url = new URL(req.url)
  const statusParam = url.searchParams.get('status') ?? 'all'
  const methodParam = url.searchParams.get('method') ?? 'all'
  const q = url.searchParams.get('q') ?? ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? '20') || 20)
  )

  const where: Prisma.PaymentWhereInput = {}
  if (statusParam !== 'all' && (STATUSES as string[]).includes(statusParam)) {
    where.status = statusParam as PaymentStatus
  }
  if (methodParam !== 'all' && (METHODS as string[]).includes(methodParam)) {
    where.method = methodParam as PaymentMethod
  }
  if (q.trim()) {
    where.user = {
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    }
  }

  const [total, items, pendingCount] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true, name: true } },
        pricing: { select: { code: true, name: true, amountFils: true } },
      },
    }),
    prisma.payment.count({
      where: { status: { in: ['pending_whatsapp', 'pending_ziina'] } },
    }),
  ])

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    pendingCount,
  })
}
