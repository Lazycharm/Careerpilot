/**
 * Pricing-driven entitlements.
 *
 * One source of truth for "what can this user currently do?". Reads the
 * user's active Subscription, resolves its `pricingId` to the Pricing row,
 * then projects the row's `features` JSON into a stable `Entitlements`
 * shape consumers can branch on.
 *
 * Backwards compatibility: if the subscription has no `pricingId` yet
 * (rows created before this migration), we fall back to mapping the
 * legacy `planType` enum onto a sensible entitlement set so nothing breaks
 * during the cutover.
 *
 * Usage:
 *   const ent = await getEntitlements(userId)
 *   if (!ent.canDownloadResume) return paywall()
 */

import { prisma } from '@/lib/prisma'
import type { Pricing, Subscription } from '@prisma/client'

export interface Entitlements {
  /** Plan code the entitlement was derived from. `null` = no active sub. */
  pricingCode: string | null
  /** Plan display name, suitable for "Current plan: …" badges. */
  planName: string
  /** ISO date when the current period ends, or null for one-shot bundles. */
  currentPeriodEnd: string | null

  /** Resume PDF downloads in the current period. `null` = unlimited. */
  resumeDownloadsRemaining: number | null
  /** Cover-letter PDF downloads in the current period. `null` = unlimited. */
  coverLetterDownloadsRemaining: number | null

  /** Can run the AI multi-score ATS report. */
  canRunATSAnalysis: boolean
  /** Can generate AI cover letters. */
  canGenerateCoverLetter: boolean
  /** Can tailor a CV for a Company (Phase 4 feature). */
  canTailorForCompany: boolean
  /** Can run automated job applications (Phase 6 feature). */
  canRunAutomation: boolean
}

/**
 * Read the user's current active subscription and resolve its entitlements.
 * Returns the free-tier shape if no active subscription exists.
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gte: new Date() } }],
    },
    orderBy: { currentPeriodEnd: 'desc' },
    include: { pricing: true },
  })

  if (!sub) return FREE_ENTITLEMENTS

  if (sub.pricing) {
    return projectPricing(sub, sub.pricing)
  }
  // Legacy bridge: sub without pricingId (created before Phase 4). Map the
  // PlanType enum to entitlements so we don't lock paid users out mid-cutover.
  return projectLegacyPlanType(sub)
}

/** Project a Pricing row + Subscription into the runtime entitlement shape. */
function projectPricing(sub: Subscription, pricing: Pricing): Entitlements {
  const features = (pricing.features ?? {}) as Record<string, unknown>
  const periodEnd = sub.currentPeriodEnd?.toISOString() ?? null

  return {
    pricingCode: pricing.code,
    planName: pricing.name,
    currentPeriodEnd: periodEnd,
    resumeDownloadsRemaining: parseDownloadAllowance(features.downloads),
    coverLetterDownloadsRemaining: parseDownloadAllowance(
      features.coverLetterDownloads ?? features.downloads
    ),
    canRunATSAnalysis: featuresFlag(features, [
      'atsOptimization',
      'ats',
      'ai',
    ]),
    canGenerateCoverLetter: featuresFlag(features, [
      'coverLetter',
      'includesCoverLetter',
      'ai',
    ]),
    canTailorForCompany: featuresFlag(features, ['tailored', 'ai']),
    canRunAutomation: featuresFlag(features, ['automation']),
  }
}

/** Backwards compatibility for rows that have planType but no pricingId. */
function projectLegacyPlanType(sub: Subscription): Entitlements {
  const periodEnd = sub.currentPeriodEnd?.toISOString() ?? null
  switch (sub.planType) {
    case 'free':
      return FREE_ENTITLEMENTS
    case 'pay_per_download':
      return {
        ...FREE_ENTITLEMENTS,
        planName: 'Pay per download',
        resumeDownloadsRemaining: 0, // credits are tracked in Download table
        coverLetterDownloadsRemaining: 0,
      }
    case 'pro':
    case 'business':
      return {
        pricingCode: null,
        planName: sub.planType === 'pro' ? 'Pro (legacy)' : 'Business (legacy)',
        currentPeriodEnd: periodEnd,
        resumeDownloadsRemaining: null,
        coverLetterDownloadsRemaining: null,
        canRunATSAnalysis: true,
        canGenerateCoverLetter: true,
        canTailorForCompany: true,
        canRunAutomation: sub.planType === 'business',
      }
    default:
      return FREE_ENTITLEMENTS
  }
}

const FREE_ENTITLEMENTS: Entitlements = {
  pricingCode: 'free',
  planName: 'Free',
  currentPeriodEnd: null,
  resumeDownloadsRemaining: 0,
  coverLetterDownloadsRemaining: 0,
  canRunATSAnalysis: false,
  canGenerateCoverLetter: false,
  canTailorForCompany: false,
  canRunAutomation: false,
}

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Coerce a feature JSON value into a download allowance. `'unlimited'` and
 * `null` both mean "no cap"; numbers are returned as-is; everything else
 * falls through to 0 so undefined never accidentally grants downloads.
 */
function parseDownloadAllowance(v: unknown): number | null {
  if (v === 'unlimited') return null
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.floor(v))
  return 0
}

/** True iff at least one of the named feature flags resolves truthy. */
function featuresFlag(features: Record<string, unknown>, keys: string[]): boolean {
  for (const k of keys) {
    const v = features[k]
    if (v === true) return true
    if (typeof v === 'number' && v > 0) return true
    if (typeof v === 'string' && v.toLowerCase() !== 'false' && v !== '0' && v !== '') {
      return true
    }
  }
  return false
}
