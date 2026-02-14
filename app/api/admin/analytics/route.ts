import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get average readiness score
    const completedInterviews = await prisma.interviewSession.findMany({
      where: {
        status: 'completed',
        readinessScore: { not: null },
      },
      select: { readinessScore: true },
    })

    const averageReadinessScore = completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.readinessScore || 0), 0) /
          completedInterviews.length
        )
      : 0

    // Get total downloads
    const totalDownloads = await prisma.download.count()

    // Get top industries
    const industryCounts = await prisma.interviewSession.groupBy({
      by: ['industry'],
      _count: { industry: true },
      orderBy: { _count: { industry: 'desc' } },
      take: 5,
    })

    const topIndustries = industryCounts.map(item => ({
      industry: item.industry,
      count: item._count.industry,
    }))

    return NextResponse.json({
      averageReadinessScore,
      totalDownloads,
      completedInterviews: completedInterviews.length,
      topIndustries,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

