/**
 * GET /api/companies
 *
 * Public list of active companies. Authenticated users browse this to pick
 * a target for tailored CV/CL generation.
 *
 * Query: ?industry=&category=&q=&limit=50
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const industry = url.searchParams.get('industry') ?? undefined
  const category = url.searchParams.get('category') ?? undefined
  const q = url.searchParams.get('q') ?? ''
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '50') || 50))

  const where: Prisma.CompanyWhereInput = { isActive: true }
  if (industry) where.industry = industry
  if (category) where.category = category
  if (q.trim()) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ]
  }

  const companies = await prisma.company.findMany({
    where,
    orderBy: [{ name: 'asc' }],
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      industry: true,
      category: true,
      hqCity: true,
      hqCountry: true,
    },
  })
  return NextResponse.json({ companies })
}
