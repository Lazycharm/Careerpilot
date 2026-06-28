/**
 * GET /api/email-accounts → list the caller's connected accounts.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const accounts = await prisma.emailAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      provider: true,
      emailAddress: true,
      displayName: true,
      scopes: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
    },
  })
  return NextResponse.json({ accounts })
}
