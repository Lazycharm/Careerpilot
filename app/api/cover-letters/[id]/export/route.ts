/**
 * GET /api/cover-letters/[id]/export
 *
 * Phase 1 rewrite — drops Puppeteer + html2pdf.fly.dev fallback. Uses the new
 * React-PDF server renderer (lib/coverLetter/pdfGenerator → renderCoverLetterPDF).
 * Entitlement logic preserved verbatim from the original implementation.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanType } from '@/lib/subscription'
import { renderCoverLetterPDF } from '@/lib/coverLetter/pdfGenerator'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success, reset } = await rateLimit('ai').limit(
      identifyRequest(_request, session.user.id)
    )
    if (!success) return rateLimited(reset)

    // ── Entitlement (preserved verbatim from prior implementation) ──
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
          type: 'cover_letter',
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
      await prisma.download.delete({ where: { id: credit.id } })
    }
    if (planType === 'pro' || planType === 'business') {
      await prisma.download.create({
        data: {
          userId: session.user.id,
          type: 'cover_letter',
          paid: true,
        },
      })
    }

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
    }

    // Render the PDF. We do not have candidate/company fields on the model in
    // Phase 1; the template gracefully handles missing metadata.
    const { buffer } = await renderCoverLetterPDF({
      content: coverLetter.content ?? '',
      jobTitle: coverLetter.jobTitle ?? undefined,
    })

    const filename = `cover-letter-${sanitizeFilename(coverLetter.jobTitle) || 'letter'}.pdf`
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
    console.error('[cover-letter.export]', err)
    return NextResponse.json({ error: 'Failed to export cover letter' }, { status: 500 })
  }
}

function sanitizeFilename(name: string): string {
  return (name ?? '').replace(/[^\w\-. ]+/g, '').trim().slice(0, 80)
}
