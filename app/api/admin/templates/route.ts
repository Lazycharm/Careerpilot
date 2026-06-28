import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const templates = await prisma.resumeTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { resumes: true } } },
  })
  return NextResponse.json({ templates })
}

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  previewImage: z.union([z.string().url(), z.literal(''), z.null()]).optional().transform(v => v === '' ? null : v),
  supportsPhoto: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  const template = await prisma.resumeTemplate.create({
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      previewImage: parsed.data.previewImage || null,
      supportsPhoto: parsed.data.supportsPhoto,
      isPremium: parsed.data.isPremium,
      isActive: parsed.data.isActive,
      metadata: parsed.data.metadata || {},
    },
  })

  return NextResponse.json(template, { status: 201 })
}
