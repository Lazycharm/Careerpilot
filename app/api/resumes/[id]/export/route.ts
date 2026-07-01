/**
 * GET /api/resumes/[id]/export
 *
 * Phase 1 rewrite:
 * - Replaced 560-line Puppeteer + html2pdf.fly.dev fallback (security risk and
 *   produced image-only PDFs) with React-PDF server rendering.
 * - Removed all debug screenshots and inline console.logs.
 * - Added rate limiting.
 * - Streamlined entitlement checks (logic preserved as-is — plan model will
 *   be replaced in Phase 3).
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanType } from '@/lib/subscription'
import { getSettingAsBoolean } from '@/lib/settings'
// Dynamic imports keep react-dom/server out of Next.js static bundle analysis.
// These modules are server-only and only loaded at runtime in this Node route.
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { recordActivity } from '@/lib/activity'

export const runtime = 'nodejs' // Puppeteer needs Node — not Edge.

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit per user — exports are expensive
    const { success, reset } = await rateLimit('ai').limit(
      identifyRequest(request, session.user.id)
    )
    if (!success) return rateLimited(reset)

    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // ── Entitlement check (preserved verbatim from prior implementation) ──
    // The plan model is scheduled for replacement in Phase 3.
    const subscriptionEnabled = await getSettingAsBoolean('subscription_enabled', false)
    const freeDownloadsEnabled = await getSettingAsBoolean('free_downloads_enabled', false)
    const skipPlanCheck = !subscriptionEnabled || freeDownloadsEnabled

    if (!skipPlanCheck) {
      const planType = await getPlanType(session.user.id)

      if (planType === 'free') {
        return NextResponse.json(
          { error: 'Download requires a paid plan. Upgrade to download PDFs.' },
          { status: 403 }
        )
      }

      if (planType === 'pay_per_download') {
        const credit = await prisma.download.findFirst({
          where: {
            userId: session.user.id,
            type: 'resume',
            paid: true,
            resumeId: null,
          },
        })
        if (!credit) {
          return NextResponse.json(
            {
              error: 'No download credit. Purchase a download to continue.',
              requiresPayment: true,
            },
            { status: 403 }
          )
        }
        await prisma.download.update({
          where: { id: credit.id },
          data: { resumeId: resume.id },
        })
      }

      if (planType === 'pro' || planType === 'business') {
        await prisma.download.create({
          data: {
            userId: session.user.id,
            resumeId: resume.id,
            type: 'resume',
            paid: true,
          },
        })
      }
    }

    // ── Resolve template key ────────────────────────────────────────────
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: resume.templateId },
    })
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    const metadata = (template.metadata ?? {}) as Record<string, unknown>
    const templateKey =
      typeof metadata.templateKey === 'string' ? metadata.templateKey : 'dubai-classic'

    // ── Render PDF via Puppeteer ────────────────────────────────────────
    const [{ renderResumeToPDF }, { migrateResumeData }] = await Promise.all([
      import('@/lib/resume/engine/renderResume'),
      import('@/lib/resume/schema'),
    ])
    const resumeData = migrateResumeData(resume.data)
    const buffer = await renderResumeToPDF(resumeData, templateKey)

    recordActivity({
      userId: session.user.id,
      event: 'resume.exported',
      meta: { resumeId: resume.id, bytes: buffer.byteLength },
    }).catch(() => {})

    const filename = `${sanitizeFilename(resume.title) || 'resume'}.pdf`
    // NextResponse body type doesn't accept Node Buffer directly — wrap as a
    // Uint8Array, which it does accept.
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    console.error('[resume.export]', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\-. ]+/g, '').trim().slice(0, 80)
}
