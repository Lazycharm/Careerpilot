/**
 * Email campaign segment compiler.
 *
 * `EmailCampaign.segmentRule` is a small JSON DSL we turn into a Prisma
 * `User` where-clause. Keeping the DSL narrow on purpose — admin chooses
 * from a closed set of filters rather than free-form SQL.
 *
 * Supported filters:
 *   { allUsers: true }
 *   { roles: ['user' | 'admin'] }
 *   { createdSince: ISO date }      — joined on or after
 *   { createdBefore: ISO date }
 *   { hasActiveSubscription: true | false }
 *   { pricingCodes: ['premium_bundle', 'monthly', ...] }
 */

import type { Prisma } from '@prisma/client'

export interface SegmentRule {
  allUsers?: boolean
  roles?: Array<'user' | 'admin'>
  createdSince?: string
  createdBefore?: string
  hasActiveSubscription?: boolean
  pricingCodes?: string[]
}

export function compileSegmentWhere(rule: SegmentRule): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (rule.allUsers) return where

  if (rule.roles?.length) {
    where.role = { in: rule.roles }
  }
  if (rule.createdSince || rule.createdBefore) {
    where.createdAt = {}
    if (rule.createdSince) (where.createdAt as any).gte = new Date(rule.createdSince)
    if (rule.createdBefore) (where.createdAt as any).lt = new Date(rule.createdBefore)
  }
  if (rule.hasActiveSubscription === true) {
    where.subscriptions = { some: { status: 'active' } }
  }
  if (rule.hasActiveSubscription === false) {
    where.subscriptions = { none: { status: 'active' } }
  }
  if (rule.pricingCodes?.length) {
    where.subscriptions = {
      some: {
        status: 'active',
        pricing: { code: { in: rule.pricingCodes } },
      },
    }
  }
  return where
}
