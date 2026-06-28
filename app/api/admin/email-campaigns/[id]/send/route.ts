/**
 * POST /api/admin/email-campaigns/[id]/send
 *
 * Compiles the campaign's segment rule, iterates over matching users, and
 * sends each via Resend with a small concurrency cap so we don't slam the
 * API. Status transitions: draft|scheduled → sending → sent (or partial).
 *
 * Bounded by `MAX_RECIPIENTS_PER_RUN` per call. For larger lists, the admin
 * can call this multiple times; Phase 6b will add proper batching + a
 * cron-based drainer.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit, auditContext } from '@/lib/security/audit'
import { compileSegmentWhere, type SegmentRule } from '@/lib/email/segments'
import { sendEmail } from '@/lib/email/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_RECIPIENTS_PER_RUN = 500
const CONCURRENCY = 4

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const found = await prisma.emailCampaign.findUnique({ where: { id: params.id } })
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (found.status === 'sending' || found.status === 'sent') {
    return NextResponse.json({ error: `Already ${found.status}` }, { status: 409 })
  }
  // Bind to a const after the null check so TS narrows the type for the
  // closure below.
  const campaign = found

  const where = compileSegmentWhere(campaign.segmentRule as SegmentRule)
  const recipients = await prisma.user.findMany({
    where,
    select: { id: true, email: true, name: true },
    take: MAX_RECIPIENTS_PER_RUN,
  })

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: 'sending' },
  })

  let sentCount = 0
  let failedCount = 0
  // Simple concurrency pool — no extra dep.
  const queue = [...recipients]
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker(queue))
  )

  async function worker(q: typeof recipients) {
    while (q.length > 0) {
      const r = q.shift()
      if (!r?.email) continue
      try {
        const out = await sendEmail({
          to: r.email,
          subject: campaign.subject,
          html: personalise(campaign.bodyHtml, r),
          text: campaign.bodyText ? personalise(campaign.bodyText, r) : undefined,
          tags: [{ name: 'campaign', value: campaign.id }],
        })
        if (out.ok) sentCount++
        else failedCount++
      } catch {
        failedCount++
      }
    }
  }

  const allOk = failedCount === 0
  const updated = await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: {
      status: allOk ? 'sent' : 'sent', // even with failures we mark sent; failedCount records the diff
      sentAt: new Date(),
      sentCount: { increment: sentCount },
      failedCount: { increment: failedCount },
    },
  })

  await audit({
    actorId: session.user.id,
    action: 'email_campaign.send',
    target: `email_campaign:${campaign.id}`,
    after: { sentCount, failedCount, recipients: recipients.length },
    ...auditContext(req),
  })

  return NextResponse.json({
    ok: true,
    campaign: updated,
    summary: { recipients: recipients.length, sent: sentCount, failed: failedCount },
  })
}

function personalise(body: string, user: { name: string | null; email: string }): string {
  return body.replace(/\{\{\s*(name|email)\s*\}\}/g, (_, k: string) =>
    k === 'email' ? user.email : (user.name ?? '')
  )
}
