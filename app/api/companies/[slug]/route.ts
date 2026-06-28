/**
 * GET /api/companies/[slug]
 *
 * Public company detail. Includes verified contacts for the tailored email
 * pipeline (Phase 6 automation).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company = await prisma.company.findFirst({
    where: { slug: params.slug, isActive: true },
    include: {
      contacts: {
        where: { verified: true },
        select: { id: true, role: true, email: true, name: true },
      },
    },
  })
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(company)
}
