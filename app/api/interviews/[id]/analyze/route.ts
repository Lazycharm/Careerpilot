import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeInterviewAnswer } from '@/lib/ai'
import { getSettingAsBoolean } from '@/lib/settings'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if AI features are enabled
    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { questionId, answer } = body

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: 'Question ID and answer are required' },
        { status: 400 }
      )
    }

    // Get question and session
    const question = await prisma.interviewQuestion.findFirst({
      where: {
        id: questionId,
        session: {
          id: params.id,
          userId: session.user.id,
        },
      },
      include: {
        session: true,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Analyze answer with AI
    const analysis = await analyzeInterviewAnswer(
      question.question,
      answer,
      question.session.jobTitle,
      question.session.industry
    )

    // Save or update answer
    await prisma.interviewAnswer.upsert({
      where: { questionId },
      update: {
        answer,
        score: analysis.score,
        feedback: analysis.feedback,
        aiAnalyzed: true,
      },
      create: {
        questionId,
        answer,
        score: analysis.score,
        feedback: analysis.feedback,
        aiAnalyzed: true,
      },
    })

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Answer analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze answer' },
      { status: 500 }
    )
  }
}

