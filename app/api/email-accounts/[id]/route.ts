/**
 * DELETE /api/email-accounts/[id] → disconnect a connected account.
 *
 * We hard-delete the row (the encrypted refresh token is destroyed with it).
 * Automations that referenced this account become orphaned — they'll be
 * paused by the cron runner on the next sweep.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const acct = await prisma.emailAccount.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!acct) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Pause any automations that depend on this account so they don't error
  // out repeatedly when the cron tries to use it.
  await prisma.automation.updateMany({
    where: { emailAccountId: acct.id, status: 'active' },
    data: { status: 'paused' },
  })

  await prisma.emailAccount.delete({ where: { id: acct.id } })
  return NextResponse.json({ ok: true })
}
