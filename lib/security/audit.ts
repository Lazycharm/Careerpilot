/**
 * Audit log helper (Phase 5: now writes to the AuditLog table).
 *
 * Every administrative or sensitive mutation must call `audit(...)` so we
 * have a defensible forensic record of who did what. Failures are swallowed
 * so audit writes can NEVER break a caller's primary action — we log the
 * failure to stdout and move on.
 */

import { prisma } from '@/lib/prisma'

export interface AuditEvent {
  actorId: string | null
  action: string // e.g. 'payment.approve', 'user.role.change'
  target?: string | null // e.g. 'payment:abc-123'
  before?: unknown
  after?: unknown
  ip?: string | null
  userAgent?: string | null
}

/**
 * Persist an audit row. Idempotent in the sense that retries simply create
 * additional rows — by design, every call is a distinct event.
 */
export async function audit(ev: AuditEvent): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: ev.actorId ?? undefined,
        action: ev.action,
        target: ev.target ?? undefined,
        before: (ev.before ?? null) as any,
        after: (ev.after ?? null) as any,
        ip: ev.ip ?? undefined,
        userAgent: ev.userAgent ?? undefined,
      },
    })
  } catch (err) {
    // Never fail the caller because audit failed. Also emit structured JSON
    // so external log aggregation still catches the event.
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        kind: 'audit_write_failed',
        action: ev.action,
        target: ev.target ?? null,
        error: (err as Error).message,
      })
    )
  }
}

/** Extracts client context from a Next.js request for audit calls. */
export function auditContext(req: Request) {
  const fwd = req.headers.get('x-forwarded-for') ?? ''
  const ip = fwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null
  const userAgent = req.headers.get('user-agent') || null
  return { ip, userAgent }
}
