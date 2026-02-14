import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { customizeCoverLetter } from '@/lib/ai'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

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

    await checkAILimit(session.user.id, 'cover_letter')

    const body = await request.json()
    const { action } = body // 'improve' | 'shorten' | 'elongate'

    if (!action || !['improve', 'shorten', 'elongate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: improve, shorten, or elongate' },
        { status: 400 }
      )
    }

    // Fetch the cover letter
    const coverLetter = await prisma.coverLetter.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Cover letter not found' },
        { status: 404 }
      )
    }

    const customizedContent = await customizeCoverLetter(
      coverLetter.content,
      action,
      coverLetter.jobTitle,
      coverLetter.industry
    )

    await incrementAIUsage(session.user.id, 'cover_letter')

    const updated = await prisma.coverLetter.update({
      where: {
        id: params.id,
      },
      data: {
        content: customizedContent,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Cover letter customization error:', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to customize cover letter' },
      { status: 500 }
    )
  }
}
