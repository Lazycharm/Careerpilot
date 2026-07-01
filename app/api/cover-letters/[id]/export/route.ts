/**
 * GET /api/cover-letters/[id]/export?template=classic
 *
 * Renders cover letter to PDF using the HTML+Puppeteer engine (same approach
 * as resume export). Accepts ?template= query param to pick from 11 templates.
 * Falls back to 'classic' if not provided or invalid.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanType } from '@/lib/subscription'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success, reset } = await rateLimit('ai').limit(
      identifyRequest(request, session.user.id)
    )
    if (!success) return rateLimited(reset)

    // ── Entitlement check ────────────────────────────────────────────────
    const planType = await getPlanType(session.user.id)
    if (planType === 'free') {
      return NextResponse.json(
        { error: 'Download requires a paid plan. Upgrade to download PDFs.' },
        { status: 403 }
      )
    }
    if (planType === 'pay_per_download') {
      const credit = await prisma.download.findFirst({
        where: { userId: session.user.id, type: 'cover_letter', paid: true, resumeId: null },
      })
      if (!credit) {
        return NextResponse.json(
          { error: 'No download credit. Purchase a download to continue.', requiresPayment: true },
          { status: 403 }
        )
      }
      await prisma.download.delete({ where: { id: credit.id } })
    }
    if (planType === 'pro' || planType === 'business') {
      await prisma.download.create({
        data: { userId: session.user.id, type: 'cover_letter', paid: true },
      })
    }

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
    }

    // Get template from query param — e.g., ?template=executive
    const url = new URL(request.url)
    const templateKey = url.searchParams.get('template') || 'classic'

    const { renderCoverLetterToPDF } = await import('@/lib/coverLetter/engine/renderCoverLetter')

    // Build cover letter data for the template
    const data = {
      content: coverLetter.content ?? '',
      jobTitle: coverLetter.jobTitle ?? undefined,
      companyName: undefined as string | undefined,
    }

    const buffer = await renderCoverLetterToPDF(data, templateKey)

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
