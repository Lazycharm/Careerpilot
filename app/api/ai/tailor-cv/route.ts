/**
 * POST /api/ai/tailor-cv
 *
 * Generates a tailored CV (and persists it as a new Resume row) for a
 * specific Company. Uses the AI router (Claude primary, OpenAI fallback)
 * with structured-JSON output, then merges the edits onto the source CV
 * non-destructively. Returns the new resumeId.
 *
 * Entitlement: `canTailorForCompany` from /lib/entitlements.
 *
 * Body:
 *   {
 *     sourceResumeId: string,
 *     companySlug: string,
 *     jobTitle?: string,    // overrides the target role if provided
 *     industry?: string,
 *     jobDescription?: string,
 *   }
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { getEntitlements } from '@/lib/entitlements'
import { aiGenerate } from '@/lib/ai/router'
import { recordActivity } from '@/lib/activity'
import {
  applyTailorEdits,
  parseTailorCVOutput,
  tailorCVSystemPrompt,
  tailorCVUserPrompt,
  type TailorCVInput,
} from '@/lib/ai/prompts/tailorCV'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Body = z.object({
  sourceResumeId: z.string().uuid(),
  companySlug: z.string().trim().min(1).max(80),
  jobTitle: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(60).optional(),
  jobDescription: z.string().trim().max(8000).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success, reset } = await rateLimit('ai').limit(
      identifyRequest(req, session.user.id)
    )
    if (!success) return rateLimited(reset)

    const ent = await getEntitlements(session.user.id)
    if (!ent.canTailorForCompany) {
      return NextResponse.json(
        { error: 'Tailoring requires the Tailored Pack or a paid plan', code: 'entitlement_required' },
        { status: 403 }
      )
    }

    const parsed = Body.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const [source, company] = await Promise.all([
      prisma.resume.findFirst({
        where: { id: parsed.data.sourceResumeId, userId: session.user.id },
        include: { template: true },
      }),
      prisma.company.findFirst({
        where: { slug: parsed.data.companySlug, isActive: true },
      }),
    ])
    if (!source) return NextResponse.json({ error: 'Source resume not found' }, { status: 404 })
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    const resumeData = (source.data ?? {}) as any
    const promptInput: TailorCVInput = {
      candidateName: resumeData?.personalInfo?.fullName ?? session.user.name ?? 'Candidate',
      candidateLocation: resumeData?.personalInfo?.location,
      candidateSummary: resumeData?.summary,
      candidateExperience: stringifyExperience(resumeData?.workExperience),
      candidateSkills: Array.isArray(resumeData?.skills)
        ? resumeData.skills.flatMap((g: any) => (Array.isArray(g.items) ? g.items : []))
        : undefined,
      jobTitle: parsed.data.jobTitle ?? source.title,
      industry: parsed.data.industry ?? company.industry ?? 'general',
      companyName: company.name,
      companyDescription: company.description ?? undefined,
      jobDescription: parsed.data.jobDescription,
      language: 'en',
    }

    const result = await aiGenerate({
      useCase: 'tailor_cv',
      userId: session.user.id,
      systemPrompt: tailorCVSystemPrompt(),
      prompt: tailorCVUserPrompt(promptInput),
      json: true,
      temperature: 0.5,
      maxTokens: 1800,
    })

    const edits = parseTailorCVOutput(result.text)
    const tailoredData = applyTailorEdits(resumeData, edits)

    // Persist as a NEW resume so the user's source remains untouched.
    const tailoredTitle = `${source.title} — ${company.name}`.slice(0, 200)
    const created = await prisma.resume.create({
      data: {
        userId: session.user.id,
        templateId: source.templateId,
        title: tailoredTitle,
        data: tailoredData as any,
        status: 'draft',
      },
    })

    // Surface it under "My Documents" automatically as a tailored resume.
    await prisma.document.create({
      data: {
        userId: session.user.id,
        type: 'tailored_resume',
        resumeId: created.id,
        title: tailoredTitle,
        tags: ['tailored', company.slug],
        metadata: {
          sourceResumeId: source.id,
          companyId: company.id,
          companySlug: company.slug,
          rationale: edits.rationale,
        } as any,
      },
    })

    recordActivity({
      userId: session.user.id,
      event: 'cv.tailored',
      meta: {
        sourceResumeId: source.id,
        tailoredResumeId: created.id,
        companyId: company.id,
        companySlug: company.slug,
      },
    }).catch(() => {})

    return NextResponse.json({
      resumeId: created.id,
      companyId: company.id,
      companySlug: company.slug,
      rationale: edits.rationale ?? null,
      meta: {
        provider: result.provider,
        model: result.model,
        fellBack: result.fellBack,
        durationMs: result.durationMs,
      },
    })
  } catch (err) {
    console.error('[ai.tailor-cv]', err)
    return NextResponse.json({ error: 'Failed to tailor CV' }, { status: 500 })
  }
}

function stringifyExperience(exp: any): string | undefined {
  if (!Array.isArray(exp) || exp.length === 0) return undefined
  return exp
    .slice(0, 4)
    .map((e: any) => {
      const head = [e.position, e.company].filter(Boolean).join(' at ')
      const dates = [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' — ')
      const bullets = Array.isArray(e.description)
        ? e.description.map((b: string) => `  - ${b}`).join('\n')
        : ''
      return [`${head} (${dates})`, bullets].filter(Boolean).join('\n')
    })
    .join('\n\n')
}
