import { prisma } from './prisma'
import { getPlanType } from './subscription'
import type { PlanType } from './subscription'

const LIMITS: Record<PlanType, { resumes: number; coverLetters: number; interviews: number }> = {
  free: { resumes: 2, coverLetters: 2, interviews: 0 },
  pay_per_download: { resumes: 2, coverLetters: 2, interviews: 0 },
  pro: { resumes: 40, coverLetters: 40, interviews: 30 },
  business: { resumes: 150, coverLetters: 150, interviews: 100 },
}

export const AI_LIMIT_EXCEEDED_MESSAGE = 'Monthly AI limit reached. Upgrade your plan.'

function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

/**
 * Get or create AIUsage record for the current month for the user.
 */
export async function getOrCreateUsage(userId: string) {
  const { month, year } = getCurrentMonthYear()
  const usage = await prisma.aIUsage.upsert({
    where: {
      userId_month_year: { userId, month, year },
    },
    create: {
      userId,
      month,
      year,
    },
    update: {},
  })
  return usage
}

/**
 * Get total usage for free tier (lifetime). For pro/business we use current month only.
 */
async function getTotalUsageForFree(userId: string) {
  const agg = await prisma.aIUsage.aggregate({
    where: { userId },
    _sum: {
      resumesGenerated: true,
      coverLettersGenerated: true,
      interviewGenerated: true,
    },
  })
  return {
    resumes: agg._sum.resumesGenerated ?? 0,
    coverLetters: agg._sum.coverLettersGenerated ?? 0,
    interviews: agg._sum.interviewGenerated ?? 0,
  }
}

/**
 * Check if user can use AI for the given type. Throws if over limit.
 * Call this BEFORE making any OpenAI request.
 */
export async function checkAILimit(
  userId: string,
  type: 'resume' | 'cover_letter' | 'interview'
): Promise<void> {
  const planType = await getPlanType(userId)
  const limits = LIMITS[planType]

  if (planType === 'free' || planType === 'pay_per_download') {
    const total = await getTotalUsageForFree(userId)
    if (type === 'resume' && total.resumes >= limits.resumes) {
      throw new Error(AI_LIMIT_EXCEEDED_MESSAGE)
    }
    if (type === 'cover_letter' && total.coverLetters >= limits.coverLetters) {
      throw new Error(AI_LIMIT_EXCEEDED_MESSAGE)
    }
    if (type === 'interview' && total.interviews >= limits.interviews) {
      throw new Error(AI_LIMIT_EXCEEDED_MESSAGE)
    }
    return
  }

  const usage = await getOrCreateUsage(userId)
  if (type === 'resume' && usage.resumesGenerated >= limits.resumes) {
    throw new Error(AI_LIMIT_EXCEEDED_MESSAGE)
  }
  if (type === 'cover_letter' && usage.coverLettersGenerated >= limits.coverLetters) {
    throw new Error(AI_LIMIT_EXCEEDED_MESSAGE)
  }
  if (type === 'interview' && usage.interviewGenerated >= limits.interviews) {
    throw new Error(AI_LIMIT_EXCEEDED_MESSAGE)
  }
}

/**
 * Increment usage after a successful AI call. Call this AFTER the OpenAI request succeeds.
 */
export async function incrementAIUsage(
  userId: string,
  type: 'resume' | 'cover_letter' | 'interview'
): Promise<void> {
  const { month, year } = getCurrentMonthYear()
  await prisma.aIUsage.upsert({
    where: {
      userId_month_year: { userId, month, year },
    },
    create: {
      userId,
      month,
      year,
      ...(type === 'resume' && { resumesGenerated: 1 }),
      ...(type === 'cover_letter' && { coverLettersGenerated: 1 }),
      ...(type === 'interview' && { interviewGenerated: 1 }),
    },
    update: {
      ...(type === 'resume' && { resumesGenerated: { increment: 1 } }),
      ...(type === 'cover_letter' && { coverLettersGenerated: { increment: 1 } }),
      ...(type === 'interview' && { interviewGenerated: { increment: 1 } }),
    },
  })
}

/**
 * Get current usage for a user (current month for pro/business, lifetime for free).
 */
export async function getUsageForUser(userId: string): Promise<{
  resumes: number
  coverLetters: number
  interviews: number
  limitResumes: number
  limitCoverLetters: number
  limitInterviews: number
  planType: PlanType
}> {
  const planType = await getPlanType(userId)
  const limits = LIMITS[planType]

  if (planType === 'free' || planType === 'pay_per_download') {
    const total = await getTotalUsageForFree(userId)
    return {
      ...total,
      limitResumes: limits.resumes,
      limitCoverLetters: limits.coverLetters,
      limitInterviews: limits.interviews,
      planType,
    }
  }

  const usage = await getOrCreateUsage(userId)
  return {
    resumes: usage.resumesGenerated,
    coverLetters: usage.coverLettersGenerated,
    interviews: usage.interviewGenerated,
    limitResumes: limits.resumes,
    limitCoverLetters: limits.coverLetters,
    limitInterviews: limits.interviews,
    planType,
  }
}
