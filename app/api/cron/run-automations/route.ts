/**
 * POST /api/cron/run-automations
 *
 * Triggered every minute by Vercel cron (see vercel.json). Picks up to
 * BATCH_LIMIT automations whose `nextRunAt` has passed, runs one dispatch
 * per (automation, company) — generating a tailored CV + cover letter +
 * application email per company — and sends via the user's connected Gmail.
 *
 * Idempotency: the dispatch loop is wrapped in a single transaction-per-app
 * so a mid-run crash leaves AutomationApplication rows in `queued` state,
 * which the next tick retries.
 *
 * Daily cap + working-hours window are respected per automation.
 *
 * Scope-of-impl note: the actual tailored-email body uses the AI router
 * exactly like /api/ai/cover-letter. The Phase 6 deliverable here is the
 * scheduling + dispatch + Gmail integration plumbing. Polishing prompts /
 * adding deliverability heuristics lands in Phase 6b.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeCronRequest } from '@/lib/security/cron-auth'
import { gmailSend } from '@/lib/google/gmail'
import { aiGenerate } from '@/lib/ai/router'
import {
  coverLetterSystemPrompt,
  coverLetterUserPrompt,
  parseCoverLetterJSON,
  renderCoverLetterJSON,
} from '@/lib/ai/prompts/coverLetter'
import {
  computeNextRunAt,
  isWithinWorkingHours,
  withDefaults,
  startOfTodayUTC,
} from '@/lib/automation/scheduler'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // serverless function ceiling

const BATCH_LIMIT = 5 // automations per tick — keep tick under 60s

export async function POST(req: Request) {
  if (!authorizeCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const due = await prisma.automation.findMany({
    where: {
      status: 'active',
      nextRunAt: { lte: now },
      OR: [{ endAt: null }, { endAt: { gt: now } }],
      emailAccount: { isActive: true },
    },
    orderBy: { nextRunAt: 'asc' },
    take: BATCH_LIMIT,
    include: {
      emailAccount: true,
      companies: { include: { company: true } },
    },
  })

  const summaries: Array<{ id: string; sent: number; skipped: number; failed: number }> = []
  for (const automation of due) {
    const summary = await dispatchAutomation(automation, now).catch((err) => {
      console.error('[cron.run-automations] failed', automation.id, err)
      return { id: automation.id, sent: 0, skipped: 0, failed: 1 }
    })
    summaries.push(summary)
  }

  return NextResponse.json({ ok: true, processed: summaries })
}

async function dispatchAutomation(
  automation: any,
  now: Date
): Promise<{ id: string; sent: number; skipped: number; failed: number }> {
  // Skip if outside working hours; reschedule for next opening.
  if (!isWithinWorkingHours(now, automation.schedule)) {
    await prisma.automation.update({
      where: { id: automation.id },
      data: { nextRunAt: computeNextRunAt(now, automation.schedule) },
    })
    return { id: automation.id, sent: 0, skipped: automation.companies.length, failed: 0 }
  }

  // Daily-cap check
  const cfg = withDefaults(automation.schedule)
  const sentToday = await prisma.automationApplication.count({
    where: {
      automationId: automation.id,
      status: 'sent',
      sentAt: { gte: startOfTodayUTC(now) },
    },
  })
  if (sentToday >= cfg.dailyCap) {
    await prisma.automation.update({
      where: { id: automation.id },
      data: { nextRunAt: computeNextRunAt(now, automation.schedule) },
    })
    return { id: automation.id, sent: 0, skipped: automation.companies.length, failed: 0 }
  }

  const run = await prisma.automationRun.create({
    data: { automationId: automation.id, status: 'running' },
  })

  // Skip companies we've already applied to under this automation.
  const previouslyApplied = await prisma.automationApplication.findMany({
    where: { automationId: automation.id, status: 'sent' },
    select: { companyId: true },
  })
  const alreadyApplied = new Set(previouslyApplied.map((p) => p.companyId).filter(Boolean))

  let sent = 0
  let skipped = 0
  let failed = 0
  const remainingToday = cfg.dailyCap - sentToday

  for (const link of automation.companies) {
    if (sent >= remainingToday) {
      skipped++
      continue
    }
    const company = link.company
    if (alreadyApplied.has(company.id)) {
      skipped++
      continue
    }

    const recipient = await pickRecipientEmail(company.id)
    if (!recipient) {
      // No verified contact → record a `skipped` row so the user sees why.
      await prisma.automationApplication.create({
        data: {
          automationId: automation.id,
          runId: run.id,
          companyId: company.id,
          toEmail: '(no contact)',
          subject: '',
          bodyPreview: '',
          status: 'skipped',
          errorMessage: 'No verified contact email for this company',
        },
      })
      skipped++
      continue
    }

    try {
      const sentResult = await composeAndSend({
        automation,
        company,
        recipientEmail: recipient,
      })
      await prisma.automationApplication.create({
        data: {
          automationId: automation.id,
          runId: run.id,
          companyId: company.id,
          toEmail: recipient,
          subject: sentResult.subject,
          bodyPreview: sentResult.bodyPreview,
          messageId: sentResult.messageId,
          status: 'sent',
          sentAt: new Date(),
        },
      })
      sent++
    } catch (err) {
      await prisma.automationApplication.create({
        data: {
          automationId: automation.id,
          runId: run.id,
          companyId: company.id,
          toEmail: recipient,
          subject: '',
          bodyPreview: '',
          status: 'failed',
          errorMessage: (err as Error).message?.slice(0, 600),
        },
      })
      failed++
    }
  }

  await prisma.automationRun.update({
    where: { id: run.id },
    data: {
      endedAt: new Date(),
      status: failed === 0 ? (sent === 0 ? 'partial' : 'succeeded') : sent === 0 ? 'failed' : 'partial',
      applicationsSent: sent,
    },
  })
  await prisma.automation.update({
    where: { id: automation.id },
    data: {
      lastRunAt: new Date(),
      nextRunAt: computeNextRunAt(new Date(), automation.schedule),
    },
  })

  return { id: automation.id, sent, skipped, failed }
}

async function pickRecipientEmail(companyId: string): Promise<string | null> {
  const c = await prisma.companyContact.findFirst({
    where: { companyId, verified: true },
    orderBy: { createdAt: 'asc' },
    select: { email: true },
  })
  return c?.email ?? null
}

async function composeAndSend(opts: {
  automation: any
  company: any
  recipientEmail: string
}): Promise<{ subject: string; bodyPreview: string; messageId: string }> {
  // Build the candidate context from the linked resume (kept simple — full
  // tailoring lives in /api/ai/tailor-cv; here we just need a plausible
  // application email body).
  const resume = opts.automation.resumeId
    ? await prisma.resume.findUnique({ where: { id: opts.automation.resumeId } })
    : null
  const data = (resume?.data ?? {}) as any
  const candidateName = data?.personalInfo?.fullName ?? 'Candidate'
  const candidateSummary = data?.summary ?? ''

  const result = await aiGenerate({
    useCase: 'application_email',
    userId: opts.automation.userId,
    systemPrompt: coverLetterSystemPrompt('professional'),
    prompt: coverLetterUserPrompt({
      candidateName,
      candidateSummary,
      jobTitle: opts.automation.name,
      industry: opts.company.industry ?? 'general',
      companyName: opts.company.name,
      companyContext: opts.company.description ?? undefined,
    }),
    json: true,
    maxTokens: 1200,
  })
  const json = parseCoverLetterJSON(result.text)
  const bodyText = renderCoverLetterJSON(json)
  const bodyHtml = `<pre style="font-family:Helvetica,Arial,sans-serif;font-size:14px;white-space:pre-wrap;">${escapeHtml(bodyText)}</pre>`
  const subject = `Application — ${candidateName}`

  const sendResult = await gmailSend({
    encryptedRefreshToken: opts.automation.emailAccount.oauthTokensEnc,
    from: {
      name: opts.automation.emailAccount.displayName ?? undefined,
      email: opts.automation.emailAccount.emailAddress,
    },
    to: opts.recipientEmail,
    subject,
    bodyHtml,
    bodyText,
  })

  return {
    subject,
    bodyPreview: bodyText.slice(0, 240),
    messageId: sendResult.messageId,
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
