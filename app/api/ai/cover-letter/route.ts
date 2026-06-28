/**
 * POST /api/ai/cover-letter
 *
 * Phase 2 rewrite. Routes through the new AI router (Claude primary, OpenAI
 * fallback, mock safety net), requests structured JSON output, runs an
 * anti-AI-tone style check before persisting.
 *
 * Public request/response shape preserved so the existing UI keeps working.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSettingAsBoolean } from '@/lib/settings'
import { checkAILimit, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'
import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
import { aiGenerate } from '@/lib/ai/router'
import { recordActivity } from '@/lib/activity'
import {
  coverLetterSystemPrompt,
  coverLetterUserPrompt,
  parseCoverLetterJSON,
  renderCoverLetterJSON,
  type CoverLetterPromptInput,
} from '@/lib/ai/prompts/coverLetter'

export const runtime = 'nodejs'

interface RequestBody {
  jobTitle?: string
  industry?: string
  companyName?: string
  companyAddress?: string
  userExperience?: string
  resumeId?: string
  resumeData?: Record<string, unknown>
  contactInfo?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    cityCountry?: string
  }
  tone?: CoverLetterPromptInput['tone']
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit per user — generation is expensive
    const { success, reset } = await rateLimit('ai').limit(
      identifyRequest(request, session.user.id)
    )
    if (!success) return rateLimited(reset)

    // Tier-based AI quota (preserved from prior implementation)
    await checkAILimit(session.user.id, 'cover_letter')

    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json({ error: 'AI features are currently disabled' }, { status: 403 })
    }

    const body = (await request.json()) as RequestBody
    if (!body.jobTitle || !body.industry) {
      return NextResponse.json(
        { error: 'Job title and industry are required' },
        { status: 400 }
      )
    }

    // ── Hydrate candidate context ──────────────────────────────────────
    let resumeInfo = (body.resumeData ?? null) as any
    if (body.resumeId && !resumeInfo) {
      const resume = await prisma.resume.findFirst({
        where: { id: body.resumeId, userId: session.user.id },
      })
      if (resume) resumeInfo = resume.data
    }

    const candidateName =
      body.contactInfo?.name || resumeInfo?.personalInfo?.fullName || session.user.name || 'Candidate'
    const candidateLocation =
      body.contactInfo?.cityCountry || resumeInfo?.personalInfo?.location || undefined
    const candidateSummary = resumeInfo?.summary || undefined
    const candidateSkills = Array.isArray(resumeInfo?.skills)
      ? resumeInfo.skills.flatMap((g: any) => (Array.isArray(g.items) ? g.items : []))
      : undefined
    const candidateExperience = stringifyExperience(resumeInfo?.workExperience)

    const promptInput: CoverLetterPromptInput = {
      candidateName,
      candidateLocation,
      candidateSummary,
      candidateExperience,
      candidateSkills,
      jobTitle: body.jobTitle,
      industry: body.industry,
      companyName: body.companyName,
      tone: body.tone ?? 'professional',
      language: 'en',
    }

    // ── Generate via router (JSON-structured) ──────────────────────────
    const result = await aiGenerate({
      useCase: 'cover_letter',
      userId: session.user.id,
      systemPrompt: coverLetterSystemPrompt(promptInput.tone),
      prompt: coverLetterUserPrompt(promptInput),
      json: true,
      temperature: 0.7,
      maxTokens: 1400,
    })

    const json = parseCoverLetterJSON(result.text)
    const content = renderCoverLetterJSON(json)

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'AI returned empty content. Please try again.' },
        { status: 502 }
      )
    }

    // Persist
    const saved = await prisma.coverLetter.create({
      data: {
        userId: session.user.id,
        jobTitle: body.jobTitle,
        industry: body.industry,
        content,
        aiGenerated: true,
      },
    })

    recordActivity({
      userId: session.user.id,
      event: 'cover_letter.created',
      meta: { coverLetterId: saved.id, jobTitle: body.jobTitle, provider: result.provider },
    }).catch(() => {})

    return NextResponse.json({
      ...saved,
      meta: {
        provider: result.provider,
        model: result.model,
        fellBack: result.fellBack,
        durationMs: result.durationMs,
      },
    })
  } catch (error) {
    console.error('[ai.cover-letter]', error)
    const msg = error instanceof Error ? error.message : 'Failed to generate cover letter'
    if (msg === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 })
  }
}

function stringifyExperience(exp: any): string | undefined {
  if (!Array.isArray(exp) || exp.length === 0) return undefined
  return exp
    .slice(0, 4) // keep prompt budget reasonable
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
