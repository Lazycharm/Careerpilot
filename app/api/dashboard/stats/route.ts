import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSettingAsBoolean } from '@/lib/settings'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user stats
    const [resumeCount, coverLetterCount, interviewSessions, downloads, subscription] = await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.coverLetter.count({ where: { userId } }),
      prisma.interviewSession.count({ where: { userId } }),
      prisma.download.count({ where: { userId } }),
      prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Calculate resume completion (simplified - can be enhanced)
    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: { status: true },
    })
    const completedResumes = resumes.filter(r => r.status === 'completed').length
    const resumeCompletion = resumeCount > 0
      ? Math.round((completedResumes / resumeCount) * 100)
      : 0

    // Calculate average interview readiness
    const completedInterviews = await prisma.interviewSession.findMany({
      where: {
        userId,
        status: 'completed',
        readinessScore: { not: null },
      },
      select: { readinessScore: true },
    })
    const interviewReadiness = completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.readinessScore || 0), 0) /
          completedInterviews.length
        )
      : 0

    // Check subscription status
    const subscriptionEnabled = await getSettingAsBoolean('subscription_enabled')
    const subscriptionActive = subscriptionEnabled && subscription !== null

    return NextResponse.json({
      resumeCount,
      resumeCompletion,
      coverLetterCount,
      interviewSessions,
      interviewReadiness,
      downloads,
      subscriptionActive,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

