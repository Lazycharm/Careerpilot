import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') return null
  return session
}

const PatchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  previewImage: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  supportsPhoto: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
}).transform(data => ({
  ...data,
  previewImage: data.previewImage === '' ? null : data.previewImage,
}))

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  const template = await prisma.resumeTemplate.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(template)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const usage = await prisma.resume.count({ where: { templateId: params.id } })
  if (usage > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${usage} resume(s) use this template. Deactivate it instead.` },
      { status: 409 }
    )
  }

  await prisma.resumeTemplate.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
