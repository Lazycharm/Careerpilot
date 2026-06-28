/**
 * /api/automations
 *
 * GET  → list the caller's automations.
 * POST → create. Body:
 *        {
 *          name: string,
 *          emailAccountId: string,
 *          resumeId?: string,
 *          coverLetterId?: string,
 *          companyIds: string[],   // links via AutomationCompany join
 *          schedule?: ScheduleConfig,
 *          generatePerCompany?: boolean,
 *          startAt?: ISO date,
 *          endAt?: ISO date,
 *        }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEntitlements } from '@/lib/entitlements'
import { recordActivity } from '@/lib/activity'
import { computeNextRunAt } from '@/lib/automation/scheduler'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ScheduleSchema = z
  .object({
    cadenceMinutes: z.number().int().min(5).max(24 * 60).optional(),
    timezone: z.string().max(60).optional(),
    startHour: z.number().int().min(0).max(23).optional(),
    endHour: z.number().int().min(1).max(24).optional(),
    dailyCap: z.number().int().min(1).max(100).optional(),
  })
  .optional()

const CreateBody = z.object({
  name: z.string().trim().min(1).max(120),
  emailAccountId: z.string().uuid(),
  resumeId: z.string().uuid().optional(),
  coverLetterId: z.string().uuid().optional(),
  companyIds: z.array(z.string().uuid()).min(1).max(50),
  generatePerCompany: z.boolean().default(true),
  schedule: ScheduleSchema,
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const items = await prisma.automation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      emailAccount: { select: { id: true, emailAddress: true, isActive: true } },
      _count: { select: { companies: true, applications: true, runs: true } },
    },
  })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ent = await getEntitlements(session.user.id)
  if (!ent.canRunAutomation) {
    return NextResponse.json(
      { error: 'Automation requires a paid plan', code: 'entitlement_required' },
      { status: 403 }
    )
  }

  const parsed = CreateBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const b = parsed.data

  // Ownership checks
  const acct = await prisma.emailAccount.findFirst({
    where: { id: b.emailAccountId, userId: session.user.id, isActive: true },
  })
  if (!acct) return NextResponse.json({ error: 'Email account not found' }, { status: 404 })

  if (b.resumeId) {
    const r = await prisma.resume.findFirst({
      where: { id: b.resumeId, userId: session.user.id },
      select: { id: true },
    })
    if (!r) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
  }
  if (b.coverLetterId) {
    const cl = await prisma.coverLetter.findFirst({
      where: { id: b.coverLetterId, userId: session.user.id },
      select: { id: true },
    })
    if (!cl) return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
  }
  // Only allow active companies
  const validCompanies = await prisma.company.findMany({
    where: { id: { in: b.companyIds }, isActive: true },
    select: { id: true },
  })
  if (validCompanies.length === 0) {
    return NextResponse.json({ error: 'No valid companies selected' }, { status: 400 })
  }

  const nextRunAt = computeNextRunAt(new Date(), b.schedule)

  const automation = await prisma.automation.create({
    data: {
      userId: session.user.id,
      emailAccountId: b.emailAccountId,
      resumeId: b.resumeId,
      coverLetterId: b.coverLetterId,
      name: b.name,
      generatePerCompany: b.generatePerCompany,
      schedule: (b.schedule ?? {}) as any,
      startAt: b.startAt ? new Date(b.startAt) : null,
      endAt: b.endAt ? new Date(b.endAt) : null,
      nextRunAt,
      companies: {
        create: validCompanies.map((c) => ({ companyId: c.id })),
      },
    },
  })

  recordActivity({
    userId: session.user.id,
    event: 'automation.created',
    meta: { automationId: automation.id, companies: validCompanies.length },
  }).catch(() => {})

  return NextResponse.json(automation, { status: 201 })
}
