import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') return null
  return session
}

const PatchSchema = z.object({
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  applicableTo: z.array(z.string()).optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await req.json().catch(() => ({}))
  const parsed = PatchSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.maxUses !== undefined && { maxUses: parsed.data.maxUses }),
      ...(parsed.data.expiresAt !== undefined && {
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      }),
      ...(parsed.data.applicableTo !== undefined && { applicableTo: parsed.data.applicableTo }),
    },
  })

  return NextResponse.json(coupon)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Soft-delete by deactivating — preserve usage history
  const coupon = await prisma.coupon.update({
    where: { id: params.id },
    data: { isActive: false },
  })

  return NextResponse.json(coupon)
}
