/**
 * UAE Hiring Score.
 *
 * Region-specific signals that boost or hurt a candidate in the UAE/GCC
 * recruiter's eyes: visa context, languages, regional experience markers,
 * Emiratization-relevant disclosure, etc.
 */

import type { ResumeData } from '@/types'
import type { ScoreResult } from '../types'
import { UAE_GENERAL_KEYWORDS } from '../keywords/uae'

export function scoreUAEHiring(data: ResumeData): ScoreResult {
  const issues: ScoreResult['issues'] = []
  let score = 50 // start neutral, add points for positive signals

  const haystack = stringify(data)
  const lower = haystack.toLowerCase()

  // Region context ---------------------------------------------------------
  const regionMentions = UAE_GENERAL_KEYWORDS.filter((k) =>
    lower.includes(k.toLowerCase())
  )
  if (regionMentions.length === 0) {
    issues.push({
      severity: 'medium',
      section: 'summary',
      message: 'No UAE / Gulf region context found',
      fix: 'Reference UAE, Dubai/Abu Dhabi, or GCC in summary or experience',
    })
  } else {
    score += Math.min(15, regionMentions.length * 3)
  }

  // Location field --------------------------------------------------------
  const loc = (data.personalInfo.location ?? '').toLowerCase()
  const isUAELoc = /uae|dubai|abu dhabi|sharjah|ajman|fujairah|ras al khaimah|umm al quwain/.test(
    loc
  )
  if (isUAELoc) {
    score += 8
  } else {
    issues.push({
      severity: 'low',
      section: 'personalInfo',
      message: 'Location does not indicate UAE residency',
      fix: 'If you live in the UAE, state the emirate (e.g. Dubai, UAE)',
    })
  }

  // Phone in UAE format ---------------------------------------------------
  const phone = (data.personalInfo.phone ?? '').replace(/\s+/g, '')
  if (/^\+9715/.test(phone) || /^9715/.test(phone) || /^05\d{8}/.test(phone)) {
    score += 5
  }

  // Languages -------------------------------------------------------------
  const langs = data.languages.map((l) => l.language.toLowerCase())
  const hasEnglish = langs.some((l) => l.includes('english'))
  const hasArabic = langs.some((l) => l.includes('arabic'))
  if (hasArabic) score += 12
  else
    issues.push({
      severity: 'low',
      section: 'languages',
      message: 'Arabic proficiency not declared',
      fix: 'If you can read/write/speak any Arabic, list the level — even Beginner helps',
    })
  if (hasEnglish) score += 6

  // Visa transparency -----------------------------------------------------
  const mentionsVisa = /visa|residency|sponsorship|transferable|nocs|noc/.test(lower)
  if (mentionsVisa) score += 6

  // Tenure stability (avoid pattern of <12-month jobs) --------------------
  const shortRoles = data.workExperience.filter((e) => {
    if (!e.startDate) return false
    const endRaw = e.current ? new Date().toISOString().slice(0, 7) : e.endDate || ''
    return isLessThanMonths(e.startDate, endRaw, 12)
  }).length
  if (shortRoles >= 3) {
    score -= 8
    issues.push({
      severity: 'medium',
      section: 'workExperience',
      message: 'Pattern of short tenures (<12 months) — UAE recruiters notice',
      fix: 'Frame short stints honestly (contract, project-based) in role context',
    })
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    issues,
    metadata: {
      regionMentions,
      hasArabic,
      hasEnglish,
      uaePhoneFormat: /^(\+?971|05)/.test(phone),
      shortRoleCount: shortRoles,
    },
  }
}

function stringify(data: ResumeData): string {
  return [
    data.summary ?? '',
    data.personalInfo.location ?? '',
    ...data.workExperience.map((e) =>
      [e.position, e.company, e.location, ...(e.description ?? [])].join(' ')
    ),
    ...data.languages.map((l) => `${l.language} ${l.proficiency}`),
  ].join(' ')
}

/** Compare two YYYY-MM strings, fall back to original strings if parse fails. */
function isLessThanMonths(startRaw: string, endRaw: string, monthsLimit: number): boolean {
  const a = parseYM(startRaw)
  const b = endRaw ? parseYM(endRaw) : new Date()
  if (!a || !b) return false
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  return months < monthsLimit
}

function parseYM(s: string): Date | null {
  // Accept "2023", "2023-03", "Mar 2023", "03/2023", etc.
  if (/^\d{4}$/.test(s)) return new Date(`${s}-01-01`)
  if (/^\d{4}-\d{2}/.test(s)) return new Date(`${s}-01`)
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}
