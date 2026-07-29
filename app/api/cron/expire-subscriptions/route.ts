/**
 * GET/POST /api/cron/expire-subscriptions
 *
 * Daily sweep (see vercel.json's schedule — this doc comment previously
 * said "Hourly", which was never true) — flips `Subscription.status` from
 * `active` to `expired` for any row whose `currentPeriodEnd` is in the
 * past. Cheap to run; bounded because we only touch rows that actually
 * need flipping.
 *
 * Vercel Cron invokes via GET; this route was POST-only until 2026-07-30,
 * which meant Vercel's actual request always hit Next.js's automatic 405
 * before authorizeCronRequest() ever ran — this sweep had never fired in
 * production. Exporting both GET and POST fixes Vercel's caller while
 * keeping POST for manual/other cron runners.
 *
 * Sends a notification + email per expiry so the user knows.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeCronRequest } from '@/lib/security/cron-auth'
import { sendEmail } from '@/lib/email/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  return handleCronRequest(req)
}

export async function POST(req: Request) {
  return handleCronRequest(req)
}

async function handleCronRequest(req: Request) {
  if (!authorizeCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const expiring = await prisma.subscription.findMany({
    where: {
      status: 'active',
      currentPeriodEnd: { lt: now },
    },
    include: {
      user: { select: { email: true, name: true } },
      pricing: { select: { name: true } },
    },
    take: 500, // cap per tick
  })

  let processed = 0
  for (const sub of expiring) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'expired' },
    })
    processed++

    if (sub.user?.email) {
      const planName = sub.pricing?.name ?? 'your plan'
      await prisma.notification.create({
        data: {
          userId: sub.userId,
          channel: 'in_app',
          title: `${planName} expired`,
          body: 'Renew to keep downloads and AI tailoring active.',
          href: '/subscription',
        },
      })
      await sendEmail({
        to: sub.user.email,
        subject: `Your CareerPilot plan has expired`,
        html: `<p>Hi ${sub.user.name ?? 'there'},</p>
               <p>Your <strong>${planName}</strong> has expired. Renew any time to keep
               downloads and AI tailoring active.</p>
               <p><a href="/subscription">Renew</a></p>`,
        text: `Your ${planName} has expired. Renew to keep downloads and AI tailoring active.`,
      }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true, processed })
}
