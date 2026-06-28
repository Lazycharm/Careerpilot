/**
 * /api/admin/email-campaigns
 *
 * GET  → list campaigns + paginate.
 * POST → create. Body: { name, subject, bodyHtml, bodyText?, segmentRule, scheduledFor? }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit, auditContext } from '@/lib/security/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SegmentRule = z.object({
  allUsers: z.boolean().optional(),
  roles: z.array(z.enum(['user', 'admin'])).optional(),
  createdSince: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  hasActiveSubscription: z.boolean().optional(),
  pricingCodes: z.array(z.string()).optional(),
})

const CreateBody = z.object({
  name: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(200),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional(),
  segmentRule: SegmentRule,
  scheduledFor: z.string().datetime().nullable().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const items = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = CreateBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const row = await prisma.emailCampaign.create({
    data: {
      name: parsed.data.name,
      subject: parsed.data.subject,
      bodyHtml: parsed.data.bodyHtml,
      bodyText: parsed.data.bodyText,
      segmentRule: parsed.data.segmentRule as any,
      scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null,
      status: parsed.data.scheduledFor ? 'scheduled' : 'draft',
      createdBy: session.user.id,
    },
  })
  await audit({
    actorId: session.user.id,
    action: 'email_campaign.create',
    target: `email_campaign:${row.id}`,
    after: { name: row.name, segmentRule: row.segmentRule },
    ...auditContext(req),
  })
  return NextResponse.json(row, { status: 201 })
}
