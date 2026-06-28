/**
 * /api/documents
 *
 * GET — list the caller's documents. Filterable by folder id and type.
 *   ?folderId=<uuid|null|all>
 *   ?type=resume|cover_letter|ats_report|tailored_resume|tailored_cover_letter|all
 *   ?q=<title substring>
 *
 * POST — create a Document pointer for an existing resume or cover letter.
 *   Body: { type, resumeId? | coverLetterId?, folderId?, title, tags? }
 *   Used by the editor to organise an output into a folder.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { DocumentType, Prisma } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_TYPES = new Set<DocumentType>([
  'resume',
  'cover_letter',
  'ats_report',
  'tailored_resume',
  'tailored_cover_letter',
])

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const folderParam = url.searchParams.get('folderId')
  const typeParam = url.searchParams.get('type')
  const q = url.searchParams.get('q') ?? ''

  const where: Prisma.DocumentWhereInput = {
    userId: session.user.id,
    deletedAt: null,
  }
  if (folderParam === 'null' || folderParam === 'uncategorised') {
    where.folderId = null
  } else if (folderParam && folderParam !== 'all') {
    where.folderId = folderParam
  }
  if (typeParam && typeParam !== 'all' && VALID_TYPES.has(typeParam as DocumentType)) {
    where.type = typeParam as DocumentType
  }
  if (q.trim()) {
    where.title = { contains: q, mode: 'insensitive' }
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 200,
    include: {
      folder: { select: { id: true, name: true, color: true } },
      resume: { select: { id: true, status: true, templateId: true } },
      coverLetter: { select: { id: true, jobTitle: true, industry: true } },
    },
  })
  return NextResponse.json({ documents })
}

const CreateBody = z
  .object({
    type: z.enum(['resume', 'cover_letter', 'tailored_resume', 'tailored_cover_letter']),
    resumeId: z.string().uuid().optional(),
    coverLetterId: z.string().uuid().optional(),
    folderId: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(1).max(200),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .refine((b) => Boolean(b.resumeId) !== Boolean(b.coverLetterId), {
    message: 'Exactly one of resumeId or coverLetterId must be set',
  })

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

  // Verify ownership of the referenced entity.
  if (parsed.data.resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: parsed.data.resumeId, userId: session.user.id },
      select: { id: true },
    })
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
  }
  if (parsed.data.coverLetterId) {
    const cl = await prisma.coverLetter.findFirst({
      where: { id: parsed.data.coverLetterId, userId: session.user.id },
      select: { id: true },
    })
    if (!cl) return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
  }
  if (parsed.data.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: parsed.data.folderId, userId: session.user.id, deletedAt: null },
      select: { id: true },
    })
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
  }

  const doc = await prisma.document.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      resumeId: parsed.data.resumeId,
      coverLetterId: parsed.data.coverLetterId,
      folderId: parsed.data.folderId ?? null,
      title: parsed.data.title,
      tags: parsed.data.tags ?? [],
    },
  })
  return NextResponse.json(doc, { status: 201 })
}
