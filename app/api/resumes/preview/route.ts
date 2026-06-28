/**
 * POST /api/resumes/preview
 *
 * Phase 1 rewrite — returns a real PDF for in-editor preview.
 * Accepts inline ResumeData (for unsaved drafts) instead of looking up the
 * resume by id, so the editor can preview pre-save state.
 *
 * No entitlement gating here (preview is free); session required to prevent
 * abuse, and rate-limited under the `ai` bucket.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { renderResumeBuffer } from '@/lib/pdf/render'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import type { ResumeData } from '@/types'

export const runtime = 'nodejs'

interface PreviewBody {
  data: ResumeData
  templateKey?: string | null
  supportsPhoto?: boolean
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success, reset } = await rateLimit('ai').limit(
      identifyRequest(request, session.user.id)
    )
    if (!success) return rateLimited(reset)

    const body = (await request.json()) as Partial<PreviewBody>
    if (!body?.data) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 })
    }

    const { buffer } = await renderResumeBuffer({
      data: body.data,
      templateKey: body.templateKey ?? null,
    })

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // inline so the iframe in PDFPreviewDialog displays it without download
        'Content-Disposition': 'inline; filename="resume-preview.pdf"',
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    console.error('[resume.preview]', err)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}
