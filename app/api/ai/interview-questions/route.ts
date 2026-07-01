import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiGenerate } from '@/lib/ai/router'
import { getSettingAsBoolean } from '@/lib/settings'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await checkAILimit(session.user.id, 'interview')

    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json({ error: 'AI features are currently disabled' }, { status: 403 })
    }

    const body = await request.json()
    const { jobTitle, industry, experienceLevel, count = 10 } = body

    if (!jobTitle || !industry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Job title, industry, and experience level are required' },
        { status: 400 }
      )
    }

    const result = await aiGenerate({
      useCase: 'interview_questions',
      systemPrompt: 'You are a UAE career coach and interview expert. Generate practical, relevant interview questions that reflect real UAE workplace culture and hiring practices. Return only a numbered list of questions — no introductions, no explanations.',
      prompt: `Generate ${count} interview questions for a ${experienceLevel}-level ${jobTitle} in the ${industry} industry in the UAE.

Include a mix of:
- UAE workplace culture questions (diversity, work-life balance, hierarchy)
- Role-specific technical or functional questions
- Behavioral/situational questions (STAR-method friendly)
- Questions about working in UAE (visa, relocation, goals)

Format: numbered list, one question per line, no extra text.`,
      temperature: 0.7,
      maxTokens: 800,
    })

    const questions = result.text
      .split('\n')
      .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((q: string) => q.length > 10)
      .slice(0, count)

    await incrementAIUsage(session.user.id, 'interview')

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error('[interview-questions]', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
