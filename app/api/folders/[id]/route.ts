/**
 * /api/folders/[id]
 *
 * PATCH  → rename / recolor / re-sort. Body: { name?, color?, sortOrder? }.
 * DELETE → soft-delete the folder. Documents inside are untouched (they keep
 *          the folderId but are surfaced under "Uncategorised" by the lister).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PatchBody = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  color: z.string().trim().max(20).nullable().optional(),
  sortOrder: z.number().int().optional(),
})

async function loadOwn(userId: string, id: string) {
  return prisma.folder.findFirst({
    where: { id, userId, deletedAt: null },
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const existing = await loadOwn(session.user.id, params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = PatchBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const updated = await prisma.folder.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name ?? undefined,
      color: parsed.data.color === undefined ? undefined : parsed.data.color,
      sortOrder: parsed.data.sortOrder ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const existing = await loadOwn(session.user.id, params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.folder.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  })
  return NextResponse.json({ ok: true })
}
