/**
 * POST /api/documents/move
 *
 * Batch-move one or more documents into a folder (or to "uncategorised" by
 * passing folderId: null).
 *
 * Body: { documentIds: string[], folderId: string | null }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Body = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(100),
  folderId: z.string().uuid().nullable(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  // Authorise: target folder must belong to the caller (or be null).
  if (parsed.data.folderId) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: parsed.data.folderId,
        userId: session.user.id,
        deletedAt: null,
      },
      select: { id: true },
    })
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
  }

  // Only update documents the caller owns; the .updateMany scope-clauses also
  // serve as authorisation.
  const result = await prisma.document.updateMany({
    where: {
      id: { in: parsed.data.documentIds },
      userId: session.user.id,
      deletedAt: null,
    },
    data: { folderId: parsed.data.folderId },
  })

  return NextResponse.json({ moved: result.count })
}
