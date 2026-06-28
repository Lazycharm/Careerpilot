/**
 * /api/admin/pricing/[id]
 *
 * PATCH  → partial update.
 * DELETE → hard-delete. Blocks if a Payment still references the row to keep
 *          historical receipts intact (FK without cascade).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit, auditContext } from '@/lib/security/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PatchBody = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  amountFils: z.number().int().min(0).optional(),
  currency: z.string().trim().length(3).optional(),
  durationDays: z.number().int().positive().nullable().optional(),
  features: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const before = await prisma.pricing.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = PatchBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const updated = await prisma.pricing.update({
    where: { id: before.id },
    data: { ...parsed.data, features: parsed.data.features as any },
  })
  await audit({
    actorId: session.user.id,
    action: 'pricing.update',
    target: `pricing:${before.id}`,
    before,
    after: updated,
    ...auditContext(req),
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const existing = await prisma.pricing.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const refCount = await prisma.payment.count({ where: { pricingId: params.id } })
  if (refCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete — ${refCount} payment(s) reference this plan. Mark inactive instead.`,
        code: 'has_references',
      },
      { status: 409 }
    )
  }
  await prisma.pricing.delete({ where: { id: params.id } })
  await audit({
    actorId: session.user.id,
    action: 'pricing.delete',
    target: `pricing:${params.id}`,
    before: existing,
    ...auditContext(_req),
  })
  return NextResponse.json({ ok: true })
}
