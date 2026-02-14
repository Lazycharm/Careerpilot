import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get session with all answers
    const interviewSession = await prisma.interviewSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        questions: {
          include: {
            answer: true,
          },
        },
      },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    // Calculate overall readiness score
    const answeredQuestions = interviewSession.questions.filter(q => q.answer)
    const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.answer?.score || 0), 0)
    const averageScore = answeredQuestions.length > 0
      ? Math.round(totalScore / answeredQuestions.length)
      : 0

    // Extract strengths and weaknesses from feedback
    const strengths: string[] = []
    const weaknesses: string[] = []

    answeredQuestions.forEach(q => {
      if (q.answer?.feedback) {
        const feedback = q.answer.feedback.toLowerCase()
        if (q.answer.score && q.answer.score >= 70) {
          strengths.push(q.question)
        } else {
          weaknesses.push(q.question)
        }
      }
    })

    // Update session
    const updated = await prisma.interviewSession.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        readinessScore: averageScore,
        strengths: strengths.length > 0 ? strengths.join('; ') : null,
        weaknesses: weaknesses.length > 0 ? weaknesses.join('; ') : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Interview completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

