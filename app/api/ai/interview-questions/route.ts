import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateInterviewQuestions } from '@/lib/ai'
import { getSettingAsBoolean } from '@/lib/settings'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await checkAILimit(session.user.id, 'interview')

    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobTitle, industry, experienceLevel, count = 10 } = body

    if (!jobTitle || !industry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Job title, industry, and experience level are required' },
        { status: 400 }
      )
    }

    const questions = await generateInterviewQuestions(
      jobTitle,
      industry,
      experienceLevel,
      count
    )

    await incrementAIUsage(session.user.id, 'interview')

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error('Interview questions generation error:', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

