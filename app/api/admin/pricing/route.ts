/**
 * /api/admin/pricing
 *
 * GET  → list all Pricing rows (active + inactive).
 * POST → create. Body: { code, name, description?, amountFils, currency?, durationDays?, features?, isActive?, sortOrder? }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit, auditContext } from '@/lib/security/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CreateBody = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_]+$/i, 'code must be alphanumeric + underscores'),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  amountFils: z.number().int().min(0),
  currency: z.string().trim().length(3).default('AED'),
  durationDays: z.number().int().positive().nullable().optional(),
  features: z.record(z.unknown()).default({}),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await prisma.pricing.findMany({
    orderBy: [{ sortOrder: 'asc' }, { amountFils: 'asc' }],
  })
  return NextResponse.json({ items: rows })
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
    const row = await prisma.pricing.create({
      data: { ...parsed.data, features: parsed.data.features as any },
    })
    await audit({
      actorId: session.user.id,
      action: 'pricing.create',
      target: `pricing:${row.id}`,
      after: row,
      ...auditContext(req),
    })
    return NextResponse.json(row, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    }
    throw err
  }
}
