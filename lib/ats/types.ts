/** Shared types for the ATS scoring engine. */

export type Severity = 'high' | 'medium' | 'low'

export interface ScoreIssue {
  severity: Severity
  section: string // e.g. 'summary', 'workExperience'
  message: string
  fix: string
}

export interface ScoreResult {
  /** 0-100, integer. */
  score: number
  issues: ScoreIssue[]
  /** Optional per-scorer metadata (e.g. matched keywords, AI-tells found). */
  metadata?: Record<string, unknown>
}

export interface MultiScoreReport {
  scores: {
    ats: number
    recruiter: number
    readability: number
    industryMatch: number
    uaeHiring: number
  }
  issues: ScoreIssue[]
  keywords: {
    matched: string[]
    missing: string[]
  }
  meta: {
    industry: string | null
    jobDescriptionProvided: boolean
    generatedAt: string // ISO
  }
}
