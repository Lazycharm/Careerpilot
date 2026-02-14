import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(interviewSession)
  } catch (error) {
    console.error('Interview fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

