/**
 * ATS Score.
 *
 * Probability the resume's text layer parses cleanly into structured fields
 * by typical ATS systems used in UAE (Taleo, Workday, SuccessFactors).
 *
 * Heuristics — penalties for structural smells, bonuses for clean signals.
 */

import type { ResumeData } from '@/types'
import type { ScoreResult } from '../types'

export function scoreATS(data: ResumeData, jobDescription?: string): ScoreResult {
  const issues: ScoreResult['issues'] = []
  let score = 100

  // Required identification fields ------------------------------------------
  const p = data.personalInfo
  if (!p.fullName?.trim()) {
    score -= 15
    issues.push({
      severity: 'high',
      section: 'personalInfo',
      message: 'Full name missing — ATS cannot identify candidate',
      fix: 'Add your full legal name to the personal information block',
    })
  }
  if (!p.email?.trim() || !/^\S+@\S+\.\S+$/.test(p.email)) {
    score -= 12
    issues.push({
      severity: 'high',
      section: 'personalInfo',
      message: 'Email missing or malformed',
      fix: 'Use a professional email address (e.g. firstname.lastname@gmail.com)',
    })
  }
  if (!p.phone?.trim()) {
    score -= 8
    issues.push({
      severity: 'medium',
      section: 'personalInfo',
      message: 'Phone number missing — recruiters often filter on contactability',
      fix: 'Add a UAE-format phone number (e.g. +9715XXXXXXXX)',
    })
  }
  if (!p.location?.trim()) {
    score -= 6
    issues.push({
      severity: 'medium',
      section: 'personalInfo',
      message: 'Location missing — UAE recruiters often filter by emirate',
      fix: 'Add your current city (e.g. Dubai, UAE)',
    })
  }

  // Photo penalty: most UAE ATS systems strip images and some fail outright on
  // PDFs with embedded raster headshots. Keep it warning-level.
  if (p.photo) {
    score -= 3
    issues.push({
      severity: 'low',
      section: 'personalInfo',
      message: 'Photo embedded — some ATS pipelines reject PDFs with images',
      fix: 'Consider using a photo-free template for online applications',
    })
  }

  // Summary ------------------------------------------------------------------
  const sLen = (data.summary ?? '').trim().length
  if (sLen === 0) {
    score -= 10
    issues.push({
      severity: 'high',
      section: 'summary',
      message: 'Professional summary missing',
      fix: 'Add a 3–4 sentence summary leading with your strongest specialty',
    })
  } else if (sLen < 80) {
    score -= 4
    issues.push({
      severity: 'medium',
      section: 'summary',
      message: 'Summary too short to be useful',
      fix: 'Expand to 3–4 sentences with concrete skills and outcome',
    })
  }

  // Work experience ----------------------------------------------------------
  if (data.workExperience.length === 0) {
    score -= 20
    issues.push({
      severity: 'high',
      section: 'workExperience',
      message: 'No work experience entries',
      fix: 'Add at least one role — internships and freelance count',
    })
  } else {
    const noBullets = data.workExperience.filter((e) => (e.description?.length ?? 0) === 0)
    if (noBullets.length > 0) {
      score -= Math.min(12, noBullets.length * 4)
      issues.push({
        severity: 'medium',
        section: 'workExperience',
        message: `${noBullets.length} role(s) have no bullet points`,
        fix: 'Add 3–5 outcome-led bullets per role',
      })
    }
    const noDates = data.workExperience.filter((e) => !e.startDate)
    if (noDates.length > 0) {
      score -= Math.min(8, noDates.length * 3)
      issues.push({
        severity: 'medium',
        section: 'workExperience',
        message: 'Some roles missing start date — ATS cannot infer chronology',
        fix: 'Use ISO-style month/year for every role (e.g. Mar 2023)',
      })
    }
  }

  // Education ----------------------------------------------------------------
  if (data.education.length === 0) {
    score -= 6
    issues.push({
      severity: 'low',
      section: 'education',
      message: 'No education entries',
      fix: 'Add your highest qualification — UAE employers expect it',
    })
  }

  // Skills -------------------------------------------------------------------
  if (data.skills.length === 0) {
    score -= 8
    issues.push({
      severity: 'medium',
      section: 'skills',
      message: 'No skills listed — keyword-matching ATS will rank you low',
      fix: 'Group 8–15 hard skills by category (Technical, Tools, Languages)',
    })
  }

  // Job-description keyword match -------------------------------------------
  let matched: string[] = []
  let missing: string[] = []
  if (jobDescription) {
    const jdTokens = extractKeywords(jobDescription)
    const resumeText = stringifyResume(data).toLowerCase()
    matched = jdTokens.filter((k) => resumeText.includes(k.toLowerCase()))
    missing = jdTokens.filter((k) => !resumeText.includes(k.toLowerCase()))
    const coverage = jdTokens.length ? matched.length / jdTokens.length : 1
    score = Math.round(score * (0.7 + 0.3 * coverage)) // up to 30% of score is JD-driven
  }

  return {
    score: clamp(score),
    issues,
    metadata: { matchedKeywords: matched, missingKeywords: missing },
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function stringifyResume(data: ResumeData): string {
  const parts: string[] = [
    data.summary ?? '',
    ...data.workExperience.map((e) => [e.position, e.company, ...(e.description ?? [])].join(' ')),
    ...data.education.map((e) => [e.degree, e.field, e.institution].join(' ')),
    ...data.skills.flatMap((g) => [g.category, ...g.items]),
    ...data.certifications.map((c) => [c.name, c.issuer].join(' ')),
  ]
  return parts.join(' \n ')
}

/** Naive keyword extractor: pick capitalised tokens and 3+ word noun-phrases. */
export function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'this',
    'that',
    'will',
    'your',
    'you',
    'are',
    'was',
    'has',
    'have',
    'their',
    'them',
    'they',
    'who',
    'into',
    'than',
    'over',
    'role',
    'job',
    'position',
    'we',
    'our',
  ])
  const tokens = text
    .replace(/[^A-Za-z0-9+#./& -]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const out = new Set<string>()
  for (const t of tokens) {
    const lower = t.toLowerCase()
    if (stopwords.has(lower) || lower.length < 3) continue
    // Keep tokens with a capital letter, an acronym, or a digit
    if (/[A-Z]/.test(t) || /\d/.test(t) || lower.length >= 6) {
      out.add(t)
    }
  }
  return Array.from(out).slice(0, 60)
}
