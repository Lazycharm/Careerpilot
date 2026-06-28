/**
 * Industry Match Score.
 *
 * How well the CV's vocabulary matches the chosen industry's expected
 * keyword set (curated in lib/ats/keywords/uae.ts).
 */

import type { ResumeData } from '@/types'
import type { ScoreResult } from '../types'
import { UAE_INDUSTRY_KEYWORDS } from '../keywords/uae'

export function scoreIndustryMatch(
  data: ResumeData,
  industry: string | null | undefined
): ScoreResult {
  const issues: ScoreResult['issues'] = []

  if (!industry) {
    return {
      score: 60,
      issues: [
        {
          severity: 'low',
          section: 'profile',
          message: 'Industry not specified — cannot benchmark vocabulary',
          fix: 'Set your target industry to get a tailored match score',
        },
      ],
      metadata: { industry: null, matched: [], missing: [] },
    }
  }

  const key = industry.toLowerCase()
  const library = UAE_INDUSTRY_KEYWORDS[key]
  if (!library) {
    return {
      score: 65,
      issues: [
        {
          severity: 'low',
          section: 'profile',
          message: `No curated keyword library for industry "${industry}"`,
          fix: 'Ask admin to add an industry keyword set, or pick the closest one',
        },
      ],
      metadata: { industry, matched: [], missing: [] },
    }
  }

  const haystack = stringify(data).toLowerCase()
  const matched = library.filter((k) => haystack.includes(k.toLowerCase()))
  const missing = library.filter((k) => !haystack.includes(k.toLowerCase()))

  const coverage = matched.length / library.length
  const score = Math.round(40 + 60 * coverage)

  if (coverage < 0.25) {
    issues.push({
      severity: 'high',
      section: 'skills',
      message: `Only ${matched.length}/${library.length} ${industry} keywords found`,
      fix: `Weave in 5–8 more: ${missing.slice(0, 8).join(', ')}`,
    })
  } else if (coverage < 0.5) {
    issues.push({
      severity: 'medium',
      section: 'skills',
      message: `Modest industry vocabulary coverage (${matched.length}/${library.length})`,
      fix: `Consider adding: ${missing.slice(0, 6).join(', ')}`,
    })
  }

  return {
    score,
    issues,
    metadata: { industry, matched, missing },
  }
}

function stringify(data: ResumeData): string {
  return [
    data.summary ?? '',
    ...data.workExperience.map((e) =>
      [e.position, e.company, ...(e.description ?? [])].join(' ')
    ),
    ...data.skills.flatMap((g) => [g.category, ...g.items]),
    ...data.certifications.map((c) => [c.name, c.issuer].join(' ')),
  ].join(' ')
}
