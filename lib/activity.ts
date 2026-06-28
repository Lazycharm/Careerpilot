/**
 * Activity logger — small, typed, fire-and-forget.
 *
 * Drops a row into the ActivityLog table. Used by:
 *   - The /api/activity user-facing feed (recent activity).
 *   - Admin analytics ("how many tailorings this week?").
 *   - Phase 6+ marketing automations (re-engagement triggers).
 *
 * Distinct from AuditLog: ActivityLog is product telemetry (lossy is fine);
 * AuditLog is forensic + admin actions (must persist). Failures here are
 * swallowed so we never break the user's primary action.
 */

import { prisma } from '@/lib/prisma'

/** Closed list of event keys so admin dashboards can group cleanly. */
export type ActivityEvent =
  | 'resume.created'
  | 'resume.updated'
  | 'resume.exported'
  | 'cover_letter.created'
  | 'cover_letter.exported'
  | 'cv.tailored'
  | 'ats.analyzed'
  | 'interview.started'
  | 'interview.completed'
  | 'automation.created'
  | 'automation.paused'
  | 'automation.resumed'
  | 'payment.requested'
  | 'payment.approved'
  | 'payment.rejected'

export interface RecordActivityInput {
  userId: string | null
  event: ActivityEvent
  meta?: Record<string, unknown>
}

export async function recordActivity(input: RecordActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? undefined,
        event: input.event,
        meta: (input.meta ?? null) as any,
      },
    })
  } catch (err) {
    // Activity is best-effort — never bubble up. Structured log so it shows
    // up in aggregated logs.
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        kind: 'activity_write_failed',
        event: input.event,
        userId: input.userId,
        error: (err as Error).message,
      })
    )
  }
}

/** Human-friendly verb for a recent-activity feed. */
export function activityLabel(event: ActivityEvent): string {
  switch (event) {
    case 'resume.created':
      return 'Created a CV'
    case 'resume.updated':
      return 'Updated a CV'
    case 'resume.exported':
      return 'Exported a CV'
    case 'cover_letter.created':
      return 'Generated a cover letter'
    case 'cover_letter.exported':
      return 'Exported a cover letter'
    case 'cv.tailored':
      return 'Tailored a CV'
    case 'ats.analyzed':
      return 'Ran ATS analysis'
    case 'interview.started':
      return 'Started interview prep'
    case 'interview.completed':
      return 'Completed interview prep'
    case 'automation.created':
      return 'Set up a job-application automation'
    case 'automation.paused':
      return 'Paused an automation'
    case 'automation.resumed':
      return 'Resumed an automation'
    case 'payment.requested':
      return 'Requested a payment'
    case 'payment.approved':
      return 'Payment approved'
    case 'payment.rejected':
      return 'Payment rejected'
  }
}
