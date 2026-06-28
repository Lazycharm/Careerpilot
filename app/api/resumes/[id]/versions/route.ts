/**
 * /api/resumes/[id]/versions
 *
 * GET  → list pinned versions for a resume (newest first).
 * POST → pin the current resume state as a named version. Body: { label? }.
 *
 * Auto-pinned snapshots (label=null) are created server-side by the
 * resume editor every 25 saves. Auto-pin logic lives in
 * `recordAutoVersion()` below so the editor PATCH route can call it.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PostBody = z.object({
  label: z.string().trim().min(1).max(80).optional(),
})

async function loadOwn(userId: string, id: string) {
  return prisma.resume.findFirst({ where: { id, userId } })
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const resume = await loadOwn(session.user.id, params.id)
  if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const versions = await prisma.resumeVersion.findMany({
    where: { resumeId: resume.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, label: true, createdAt: true },
    take: 100,
  })
  return NextResponse.json({ versions })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const resume = await loadOwn(session.user.id, params.id)
  if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = PostBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      label: parsed.data.label ?? null,
      data: resume.data as any,
    },
  })
  return NextResponse.json(version, { status: 201 })
}
