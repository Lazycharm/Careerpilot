/**
 * /api/admin/companies
 *
 * GET  → admin list (all, paginated, filterable).
 * POST → create. Body: { slug, name, logoUrl?, website?, industry?, category?, hqCity?, hqCountry?, description?, isActive? }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CreateBody = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/i, 'slug must be alphanumeric + dashes'),
  name: z.string().trim().min(1).max(120),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().trim().max(60).optional(),
  category: z.string().trim().max(60).optional(),
  hqCity: z.string().trim().max(60).optional(),
  hqCountry: z.string().trim().max(60).optional(),
  description: z.string().trim().max(4000).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const q = url.searchParams.get('q') ?? ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? '50') || 50))

  const where = q.trim()
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { slug: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.company.count({ where }),
  ])
  return NextResponse.json({ items, page, pageSize, total })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = CreateBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }
  try {
    const company = await prisma.company.create({ data: parsed.data })
    return NextResponse.json(company, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    throw err
  }
}
