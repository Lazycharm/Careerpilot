/**
 * Authenticates incoming cron callers.
 *
 * Convention: cron runners (Vercel cron, cron-job.org, GitHub Actions schedule)
 * send `Authorization: Bearer ${CRON_SECRET}`. We compare in constant time.
 * Vercel's built-in cron also sends `x-vercel-cron-signature` — we accept
 * either way to keep the runner choice open.
 */

import { timingSafeEqual } from 'node:crypto'
import { env } from '@/lib/env'

export function authorizeCronRequest(req: Request): boolean {
  const secret = env.CRON_SECRET
  if (!secret) return false

  const auth = req.headers.get('authorization')
  if (auth?.toLowerCase().startsWith('bearer ')) {
    const supplied = auth.slice(7).trim()
    return safeCompare(supplied, secret)
  }
  // Vercel cron signature header (constant-time check too)
  const vercelHeader = req.headers.get('x-vercel-cron-signature')
  if (vercelHeader) return safeCompare(vercelHeader, secret)

  return false
}

function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}
