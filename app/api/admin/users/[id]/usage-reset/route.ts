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
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    await prisma.aIUsage.upsert({
      where: {
        userId_month_year: { userId: params.id, month, year },
      },
      create: {
        userId: params.id,
        month,
        year,
        resumesGenerated: 0,
        coverLettersGenerated: 0,
        interviewGenerated: 0,
      },
      update: {
        resumesGenerated: 0,
        coverLettersGenerated: 0,
        interviewGenerated: 0,
      },
    })

    return NextResponse.json({ message: 'AI usage reset for current month' })
  } catch (error) {
    console.error('Admin usage reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
