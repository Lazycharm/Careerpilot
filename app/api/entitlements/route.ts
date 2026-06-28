/**
 * GET /api/entitlements
 *
 * Returns the caller's current entitlement summary so the UI can render
 * paywall states, "downloads remaining" badges, and feature affordances
 * without reimplementing the resolver client-side.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEntitlements } from '@/lib/entitlements'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ent = await getEntitlements(session.user.id)
  return NextResponse.json(ent)
}
