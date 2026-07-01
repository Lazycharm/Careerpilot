import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSettingAsBoolean } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [
      resumeCount,
      coverLetterCount,
      interviewSessions,
      downloads,
      subscription,
      recentResumes,
      recentCoverLetters,
      recentInterviews,
    ] = await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.coverLetter.count({ where: { userId } }),
      prisma.interviewSession.count({ where: { userId } }),
      prisma.download.count({ where: { userId } }),
      prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: { id: true, title: true, templateId: true, updatedAt: true, status: true },
      }),
      prisma.coverLetter.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: { id: true, jobTitle: true, industry: true, updatedAt: true },
      }),
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: { id: true, jobTitle: true, industry: true, status: true, readinessScore: true, updatedAt: true },
      }),
    ])

    // Aggregate all-time AI usage across months
    const aiUsageRows = await prisma.aIUsage.findMany({ where: { userId } })
    const aiUsage = aiUsageRows.reduce(
      (acc, row) => ({
        resumeGenerated: acc.resumeGenerated + (row.resumesGenerated ?? 0),
        coverLetterGenerated: acc.coverLetterGenerated + (row.coverLettersGenerated ?? 0),
        interviewGenerated: acc.interviewGenerated + (row.interviewGenerated ?? 0),
      }),
      { resumeGenerated: 0, coverLetterGenerated: 0, interviewGenerated: 0 }
    )

    // Resume completion: percentage of sections that have meaningful data (uses first resume)
    const firstResume = recentResumes[0]
    let resumeCompletion = 0
    if (firstResume) {
      const full = await prisma.resume.findUnique({
        where: { id: firstResume.id },
        select: { data: true },
      })
      if (full?.data) {
        try {
          const rd = typeof full.data === 'string' ? JSON.parse(full.data) : full.data
          const sections = [
            rd?.personalInfo?.fullName,
            rd?.personalInfo?.email,
            rd?.summary,
            (rd?.workExperience?.length ?? 0) > 0,
            (rd?.education?.length ?? 0) > 0,
            (rd?.skills?.length ?? 0) > 0,
          ]
          const filled = sections.filter(Boolean).length
          resumeCompletion = Math.round((filled / sections.length) * 100)
        } catch {
          resumeCompletion = 0
        }
      }
    }

    // Interview readiness: avg score from completed sessions
    const completedInterviews = await prisma.interviewSession.findMany({
      where: { userId, status: 'completed', readinessScore: { not: null } },
      select: { readinessScore: true },
    })
    const interviewReadiness =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce((s, i) => s + (i.readinessScore || 0), 0) /
              completedInterviews.length
          )
        : 0

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
      recentResumes,
      recentCoverLetters,
      recentInterviews,
      aiUsage: {
        resumeGenerated: aiUsage?.resumeGenerated ?? 0,
        coverLetterGenerated: aiUsage?.coverLetterGenerated ?? 0,
        interviewGenerated: aiUsage?.interviewGenerated ?? 0,
      },
    })
  } catch (error) {
    console.error('[dashboard.stats]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
