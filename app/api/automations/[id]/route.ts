/**
 * /api/automations/[id]
 *
 * PATCH  → update fields (name, status, schedule, companies, endAt).
 * DELETE → soft-delete (sets status to `completed`; never re-runs).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeNextRunAt } from '@/lib/automation/scheduler'
import { recordActivity } from '@/lib/activity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PatchBody = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(['active', 'paused']).optional(),
  companyIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  schedule: z
    .object({
      cadenceMinutes: z.number().int().min(5).max(24 * 60).optional(),
      timezone: z.string().max(60).optional(),
      startHour: z.number().int().min(0).max(23).optional(),
      endHour: z.number().int().min(1).max(24).optional(),
      dailyCap: z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  endAt: z.string().datetime().nullable().optional(),
})

async function loadOwn(userId: string, id: string) {
  return prisma.automation.findFirst({ where: { id, userId } })
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const automation = await prisma.automation.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      emailAccount: { select: { id: true, emailAddress: true, isActive: true } },
      companies: {
        include: { company: { select: { id: true, name: true, industry: true } } },
      },
      runs: {
        orderBy: { startedAt: 'desc' },
        take: 20,
        select: { id: true, startedAt: true, endedAt: true, status: true, applicationsSent: true, errorSummary: true },
      },
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          toEmail: true,
          subject: true,
          status: true,
          sentAt: true,
          errorMessage: true,
          company: { select: { name: true } },
        },
      },
    },
  })
  if (!automation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(automation)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const existing = await loadOwn(session.user.id, params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = PatchBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const b = parsed.data

  let companyOps: any = undefined
  if (b.companyIds) {
    const valid = await prisma.company.findMany({
      where: { id: { in: b.companyIds }, isActive: true },
      select: { id: true },
    })
    companyOps = {
      deleteMany: {},
      create: valid.map((c) => ({ companyId: c.id })),
    }
  }

  const nextSchedule = b.schedule ? { ...(existing.schedule as any), ...b.schedule } : undefined
  const updated = await prisma.automation.update({
    where: { id: existing.id },
    data: {
      name: b.name ?? undefined,
      status: b.status ?? undefined,
      schedule: nextSchedule as any,
      endAt: b.endAt === undefined ? undefined : b.endAt ? new Date(b.endAt) : null,
      nextRunAt:
        b.status === 'active'
          ? computeNextRunAt(new Date(), nextSchedule ?? (existing.schedule as any))
          : b.status === 'paused'
            ? null
            : undefined,
      companies: companyOps,
    },
  })

  if (b.status === 'paused') {
    recordActivity({
      userId: session.user.id,
      event: 'automation.paused',
      meta: { automationId: updated.id },
    }).catch(() => {})
  } else if (b.status === 'active' && existing.status !== 'active') {
    recordActivity({
      userId: session.user.id,
      event: 'automation.resumed',
      meta: { automationId: updated.id },
    }).catch(() => {})
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const existing = await loadOwn(session.user.id, params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.automation.update({
    where: { id: existing.id },
    data: { status: 'completed', nextRunAt: null, endAt: new Date() },
  })
  return NextResponse.json({ ok: true })
}
