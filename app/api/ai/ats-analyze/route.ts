/**
 * POST /api/ai/ats-analyze
 *
 * Runs the 5-score ATS engine (lib/ats) over a structured resume payload.
 * Returns the full MultiScoreReport — five scores, deduplicated issues,
 * keyword coverage, metadata.
 *
 * Persistence to an `ATSReport` table lands with the additive migration in
 * Phase 3. For now the report is returned for display only.
 *
 * Body:
 *   { data: ResumeData, industry?: string, jobDescription?: string }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeResume } from '@/lib/ats'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { recordActivity } from '@/lib/activity'
import type { ResumeData } from '@/types'

export const runtime = 'nodejs'

interface RequestBody {
  data: ResumeData
  industry?: string
  jobDescription?: string
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

    const body = (await request.json()) as Partial<RequestBody>
    if (!body?.data) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 })
    }

    const report = analyzeResume({
      data: body.data,
      industry: body.industry ?? null,
      jobDescription: body.jobDescription ?? null,
    })

    recordActivity({
      userId: session.user.id,
      event: 'ats.analyzed',
      meta: {
        industry: body.industry ?? null,
        scores: report.scores,
        jobDescriptionProvided: report.meta.jobDescriptionProvided,
      },
    }).catch(() => {})

    return NextResponse.json(report)
  } catch (err) {
    console.error('[ai.ats-analyze]', err)
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 })
  }
}
