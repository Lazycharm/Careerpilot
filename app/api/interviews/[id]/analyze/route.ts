import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiGenerate } from '@/lib/ai/router'
import { getSettingAsBoolean } from '@/lib/settings'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json({ error: 'AI features are currently disabled' }, { status: 403 })
    }

    const body = await request.json()
    const { questionId, answer } = body

    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Question ID and answer are required' }, { status: 400 })
    }

    const question = await prisma.interviewQuestion.findFirst({
      where: {
        id: questionId,
        session: { id: params.id, userId: session.user.id },
      },
      include: { session: true },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const result = await aiGenerate({
      useCase: 'interview_feedback',
      systemPrompt: 'You are a UAE career coach. Analyze interview answers and provide structured JSON feedback. Be encouraging but honest. Always return valid JSON.',
      prompt: `Analyze this interview answer for a ${question.session.jobTitle} role in ${question.session.industry} (UAE context).

Question: ${question.question}
Answer: ${answer}

Return JSON only:
{
  "score": <integer 0-100>,
  "feedback": "<detailed feedback covering: strengths, areas to improve, UAE-specific tips, and one example of a stronger answer>"
}`,
      json: true,
      temperature: 0.5,
      maxTokens: 600,
    })

    let analysis: { score: number; feedback: string }
    try {
      const raw = result.text.match(/\{[\s\S]*\}/)
      analysis = JSON.parse(raw ? raw[0] : result.text)
      if (typeof analysis.score !== 'number') analysis.score = 70
    } catch {
      analysis = { score: 70, feedback: result.text.trim() }
    }

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
    console.error('[interview.analyze]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze answer' },
      { status: 500 }
    )
  }
}
