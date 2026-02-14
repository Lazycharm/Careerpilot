import { prisma } from './prisma'
import type { PlanType as PrismaPlanType, SubscriptionStatus } from '@prisma/client'

export type PlanType = PrismaPlanType

export interface ActiveSubscription {
  id: string
  userId: string
  status: SubscriptionStatus
  planType: PlanType
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

/**
 * Get the user's active subscription (active status and current period valid).
 * Returns null if no active subscription → treat as free plan.
 */
export async function getActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gte: new Date() } },
      ],
    },
    orderBy: { currentPeriodEnd: 'desc' },
  })
  return sub as ActiveSubscription | null
}

/**
 * Get effective plan type for the user. Defaults to 'free' if no active subscription.
 */
export async function getPlanType(userId: string): Promise<PlanType> {
  const sub = await getActiveSubscription(userId)
  if (!sub) return 'free'
  return sub.planType
}
