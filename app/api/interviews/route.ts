import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInterviewQuestions } from '@/lib/ai'
import { getSettingAsBoolean } from '@/lib/settings'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        questions: {
          include: {
            answer: true,
          },
        },
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Interviews fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const interviewEnabled = await getSettingAsBoolean('interview_prep_enabled')
    if (!interviewEnabled) {
      return NextResponse.json(
        { error: 'Interview preparation is currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobTitle, industry, experienceLevel } = body

    if (!jobTitle || !industry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Job title, industry, and experience level are required' },
        { status: 400 }
      )
    }

    // Generate interview questions
    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    let questions: string[] = []

    if (aiEnabled) {
      questions = await generateInterviewQuestions(
        jobTitle,
        industry,
        experienceLevel,
        10
      )
    } else {
      // Fallback questions if AI is disabled
      questions = [
        'Tell me about yourself.',
        'Why are you interested in this position?',
        'What are your strengths?',
        'What are your weaknesses?',
        'Why do you want to work in the UAE?',
      ]
    }

    if (aiEnabled) {
      await incrementAIUsage(session.user.id, 'interview')
    }

    const session_data = await prisma.interviewSession.create({
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
      include: {
        questions: true,
      },
    })

    return NextResponse.json(session_data, { status: 201 })
  } catch (error: any) {
    console.error('Interview creation error:', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

