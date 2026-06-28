/**
 * /api/folders
 *
 * GET  → list of caller's non-deleted folders, with document counts.
 * POST → create a folder. Body: { name, color? }.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CreateBody = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().trim().max(20).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      color: true,
      sortOrder: true,
      updatedAt: true,
      _count: { select: { documents: { where: { deletedAt: null } } } },
    },
  })

  return NextResponse.json({
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      sortOrder: f.sortOrder,
      updatedAt: f.updatedAt,
      documentCount: f._count.documents,
    })),
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = CreateBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const folder = await prisma.folder.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      color: parsed.data.color,
    },
  })
  return NextResponse.json(folder, { status: 201 })
}
