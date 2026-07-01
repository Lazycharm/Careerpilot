import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiGenerate } from '@/lib/ai/router'
import { getSettingAsBoolean } from '@/lib/settings'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        questions: { include: { answer: true } },
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[interviews.GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const FALLBACK_QUESTIONS = [
  'Tell me about yourself.',
  'Why are you interested in this position?',
  'What are your greatest strengths?',
  'What is an area you are working to improve?',
  'Why do you want to work in the UAE?',
]

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await checkAILimit(session.user.id, 'interview')

    const interviewEnabled = await getSettingAsBoolean('interview_prep_enabled')
    if (!interviewEnabled) {
      return NextResponse.json({ error: 'Interview preparation is currently disabled' }, { status: 403 })
    }

    const body = await request.json()
    const { jobTitle, industry, experienceLevel } = body

    if (!jobTitle || !industry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Job title, industry, and experience level are required' },
        { status: 400 }
      )
    }

    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    let questions: string[] = FALLBACK_QUESTIONS

    if (aiEnabled) {
      const result = await aiGenerate({
        useCase: 'interview_questions',
        systemPrompt: 'You are a UAE career coach. Generate practical interview questions relevant to UAE hiring practices. Return ONLY a numbered list — no preamble or explanations.',
        prompt: `Generate 10 interview questions for a ${experienceLevel}-level ${jobTitle} role in the ${industry} industry in UAE.

Mix: UAE workplace culture, role-specific technical/functional, behavioral (STAR), and UAE-context questions.
Format: numbered list, one per line.`,
        temperature: 0.7,
        maxTokens: 800,
      })

      const parsed = result.text
        .split('\n')
        .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((q: string) => q.length > 10)
        .slice(0, 10)

      if (parsed.length >= 3) questions = parsed
      await incrementAIUsage(session.user.id, 'interview')
    }

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        jobTitle,
        industry,
        experienceLevel,
        status: 'in_progress',
        questions: {
          create: questions.map((q, idx) => ({
            question: q,
            type: idx < 3 ? 'general' : idx < 6 ? 'behavioral' : 'technical',
            aiGenerated: aiEnabled,
          })),
        },
      },
      include: { questions: true },
    })

    return NextResponse.json(interviewSession, { status: 201 })
  } catch (error: any) {
    console.error('[interviews.POST]', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
