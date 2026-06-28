/**
 * ATS Engine — orchestrator.
 *
 * Runs all five scorers and merges results into a single MultiScoreReport
 * suitable for persisting to the ATSReport table and rendering on the
 * /resume/[id]/ats page.
 *
 * Usage:
 *   const report = analyzeResume({ data, industry: 'tech', jobDescription })
 */

import type { ResumeData } from '@/types'
import type { MultiScoreReport } from './types'
import { scoreATS } from './scores/ats'
import { scoreRecruiter } from './scores/recruiter'
import { scoreReadability } from './scores/readability'
import { scoreIndustryMatch } from './scores/industryMatch'
import { scoreUAEHiring } from './scores/uaeHiring'

export interface AnalyzeOptions {
  data: ResumeData
  industry?: string | null
  jobDescription?: string | null
}

export function analyzeResume(opts: AnalyzeOptions): MultiScoreReport {
  const ats = scoreATS(opts.data, opts.jobDescription ?? undefined)
  const recruiter = scoreRecruiter(opts.data)
  const readability = scoreReadability(opts.data)
  const industryMatch = scoreIndustryMatch(opts.data, opts.industry ?? null)
  const uaeHiring = scoreUAEHiring(opts.data)

  // Issues are de-duplicated by (section + message). Severities sorted high → low.
  const seen = new Set<string>()
  const issues = [
    ...ats.issues,
    ...recruiter.issues,
    ...readability.issues,
    ...industryMatch.issues,
    ...uaeHiring.issues,
  ]
    .filter((i) => {
      const k = `${i.section}::${i.message}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))

  const matched = (ats.metadata?.matchedKeywords as string[] | undefined) ?? []
  const missing = (ats.metadata?.missingKeywords as string[] | undefined) ?? []

  return {
    scores: {
      ats: ats.score,
      recruiter: recruiter.score,
      readability: readability.score,
      industryMatch: industryMatch.score,
      uaeHiring: uaeHiring.score,
    },
    issues,
    keywords: { matched, missing },
    meta: {
      industry: opts.industry ?? null,
      jobDescriptionProvided: Boolean(opts.jobDescription),
      generatedAt: new Date().toISOString(),
    },
  }
}

function severityRank(s: 'high' | 'medium' | 'low'): number {
  return s === 'high' ? 3 : s === 'medium' ? 2 : 1
}

export type { MultiScoreReport, ScoreIssue, ScoreResult, Severity } from './types'
