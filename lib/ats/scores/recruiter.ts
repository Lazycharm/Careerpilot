/**
 * Recruiter Score.
 *
 * Approximates how a human UAE recruiter would skim the CV — looking for:
 * - Strong action verbs and quantified impact
 * - Absence of cliché / weak phrases
 * - Absence of obvious AI tells
 * - Reasonable bullet length (12–28 words sweet spot)
 * - Tenure clarity
 */

import type { ResumeData } from '@/types'
import type { ScoreResult } from '../types'
import { STRONG_ACTION_VERBS, WEAK_PHRASES, AI_TELLS } from '../keywords/uae'

export function scoreRecruiter(data: ResumeData): ScoreResult {
  const issues: ScoreResult['issues'] = []
  let score = 100

  const allBullets = data.workExperience.flatMap((e) => e.description ?? [])
  const totalBullets = allBullets.length

  if (totalBullets === 0) {
    return {
      score: 30,
      issues: [
        {
          severity: 'high',
          section: 'workExperience',
          message: 'Recruiters scan bullets first — yours has none',
          fix: 'Write 3–5 outcome-led bullets per role',
        },
      ],
    }
  }

  // Strong action verb ratio ------------------------------------------------
  const strongCount = allBullets.filter((b) => startsWithStrongVerb(b)).length
  const strongRatio = strongCount / totalBullets
  if (strongRatio < 0.5) {
    const deficit = Math.round((0.5 - strongRatio) * 30)
    score -= deficit
    issues.push({
      severity: strongRatio < 0.25 ? 'high' : 'medium',
      section: 'workExperience',
      message: `Only ${Math.round(strongRatio * 100)}% of bullets start with a strong action verb`,
      fix: 'Open bullets with verbs like Led, Delivered, Reduced, Launched, Built',
    })
  }

  // Quantified bullets ------------------------------------------------------
  const quantifiedCount = allBullets.filter((b) => /\d/.test(b)).length
  const quantifiedRatio = quantifiedCount / totalBullets
  if (quantifiedRatio < 0.4) {
    const deficit = Math.round((0.4 - quantifiedRatio) * 25)
    score -= deficit
    issues.push({
      severity: 'medium',
      section: 'workExperience',
      message: `Only ${Math.round(quantifiedRatio * 100)}% of bullets contain a number`,
      fix: 'Add a metric to most bullets (revenue, %, headcount, time saved)',
    })
  }

  // Weak phrases ------------------------------------------------------------
  const text = stringify(data).toLowerCase()
  const weakHits = WEAK_PHRASES.filter((p) => text.includes(p))
  if (weakHits.length > 0) {
    score -= Math.min(15, weakHits.length * 4)
    issues.push({
      severity: 'medium',
      section: 'workExperience',
      message: `Generic phrasing detected (${weakHits.slice(0, 3).join(', ')}${weakHits.length > 3 ? '…' : ''})`,
      fix: 'Replace with specific, evidence-backed phrasing',
    })
  }

  // AI tells ----------------------------------------------------------------
  const aiHits = AI_TELLS.filter((p) => text.includes(p))
  if (aiHits.length > 0) {
    score -= Math.min(20, aiHits.length * 6)
    issues.push({
      severity: 'high',
      section: 'summary',
      message: `AI-generated phrasing detected (${aiHits.slice(0, 2).join(', ')})`,
      fix: 'Rewrite in your own voice — recruiters can spot AI clichés',
    })
  }

  // Bullet length ----------------------------------------------------------
  const tooLong = allBullets.filter((b) => b.split(/\s+/).length > 30).length
  const tooShort = allBullets.filter((b) => b.split(/\s+/).length < 6).length
  if (tooLong > totalBullets * 0.3) {
    score -= 6
    issues.push({
      severity: 'low',
      section: 'workExperience',
      message: 'Multiple bullets are over 30 words',
      fix: 'Trim to 12–28 words each; keep one idea per bullet',
    })
  }
  if (tooShort > totalBullets * 0.3) {
    score -= 4
    issues.push({
      severity: 'low',
      section: 'workExperience',
      message: 'Multiple bullets are under 6 words',
      fix: 'Add context: what you did, how, and the outcome',
    })
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    issues,
    metadata: {
      strongVerbRatio: Number(strongRatio.toFixed(2)),
      quantifiedRatio: Number(quantifiedRatio.toFixed(2)),
      weakPhraseHits: weakHits,
      aiTellHits: aiHits,
    },
  }
}

function startsWithStrongVerb(bullet: string): boolean {
  const first = bullet.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  return STRONG_ACTION_VERBS.includes(first)
}

function stringify(data: ResumeData): string {
  return [
    data.summary ?? '',
    ...data.workExperience.flatMap((e) => e.description ?? []),
  ].join(' ')
}
