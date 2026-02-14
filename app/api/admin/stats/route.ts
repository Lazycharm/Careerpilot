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

    const now = new Date()
    const activeWhere = {
      status: 'active' as const,
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gte: now } },
      ],
    }

    const [
      totalUsers,
      totalResumes,
      totalInterviews,
      totalCoverLetters,
      activeSubscriptions,
      subsByTier,
      allUsers,
      usageRecords,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.interviewSession.count(),
      prisma.coverLetter.count(),
      prisma.subscription.count({ where: activeWhere }),
      prisma.subscription.groupBy({
        by: ['planType'],
        where: activeWhere,
        _count: true,
      }),
      prisma.user.findMany({
        select: { id: true, email: true, name: true },
      }),
      prisma.aIUsage.findMany({
        where: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        include: { user: { select: { email: true, name: true } } },
      }),
    ])

    const activeByTier = {
      free: 0,
      pay_per_download: 0,
      pro: 0,
      business: 0,
    }
    subsByTier.forEach((s) => {
      activeByTier[s.planType] = s._count
    })

    const activeSubs = await prisma.subscription.findMany({
      where: activeWhere,
      select: { userId: true, planType: true },
    })
    const planByUser = new Map<string, string>()
    activeSubs.forEach((s) => planByUser.set(s.userId, s.planType))

    const usageByUser = new Map<string, { resumes: number; coverLetters: number; interviews: number }>()
    usageRecords.forEach((u) => {
      const current = usageByUser.get(u.userId) || { resumes: 0, coverLetters: 0, interviews: 0 }
      usageByUser.set(u.userId, {
        resumes: current.resumes + u.resumesGenerated,
        coverLetters: current.coverLetters + u.coverLettersGenerated,
        interviews: current.interviews + u.interviewGenerated,
      })
    })

    const limits: Record<string, { resumes: number; coverLetters: number; interviews: number }> = {
      free: { resumes: 2, coverLetters: 2, interviews: 0 },
      pay_per_download: { resumes: 2, coverLetters: 2, interviews: 0 },
      pro: { resumes: 40, coverLetters: 40, interviews: 30 },
      business: { resumes: 150, coverLetters: 150, interviews: 100 },
    }

    const aiUsagePerUser: Array<{
      userId: string
      email: string
      name: string
      planType: string
      resumes: number
      coverLetters: number
      interviews: number
      limitResumes: number
      limitCoverLetters: number
      limitInterviews: number
      nearLimit: boolean
    }> = allUsers.map((user) => {
      const planType = planByUser.get(user.id) || 'free'
      const usage = usageByUser.get(user.id) || { resumes: 0, coverLetters: 0, interviews: 0 }
      const lim = limits[planType]
      const nearLimit =
        (lim.resumes > 0 && usage.resumes >= lim.resumes * 0.8) ||
        (lim.coverLetters > 0 && usage.coverLetters >= lim.coverLetters * 0.8) ||
        (lim.interviews > 0 && usage.interviews >= lim.interviews * 0.8)
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        planType,
        resumes: usage.resumes,
        coverLetters: usage.coverLetters,
        interviews: usage.interviews,
        limitResumes: lim.resumes,
        limitCoverLetters: lim.coverLetters,
        limitInterviews: lim.interviews,
        nearLimit,
      }
    })

    const usersCloseToLimit = aiUsagePerUser.filter((u) => u.nearLimit)

    return NextResponse.json({
      totalUsers,
      totalResumes,
      totalInterviews,
      totalCoverLetters,
      activeSubscriptions,
      activeSubscriptionsByTier: activeByTier,
      monthlyRevenue: null,
      aiUsagePerUser,
      usersCloseToLimit,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

