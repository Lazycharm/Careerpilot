/**
 * Readability Score.
 *
 * Flesch Reading Ease applied to summary + bullets. UAE recruiters often skim
 * in their second or third language — keep grade level at college-level English
 * or below (FRE ≥ 50 ideal).
 */

import type { ResumeData } from '@/types'
import type { ScoreResult } from '../types'

export function scoreReadability(data: ResumeData): ScoreResult {
  const issues: ScoreResult['issues'] = []
  const text = [
    data.summary ?? '',
    ...data.workExperience.flatMap((e) => e.description ?? []),
  ]
    .join(' ')
    .trim()

  if (text.length < 50) {
    return {
      score: 40,
      issues: [
        {
          severity: 'medium',
          section: 'summary',
          message: 'Not enough text to assess readability',
          fix: 'Write a real summary and detailed bullets first',
        },
      ],
      metadata: { fre: null, gradeLevel: null },
    }
  }

  const sentences = countSentences(text)
  const words = countWords(text)
  const syllables = countSyllablesInText(text)

  if (sentences === 0 || words === 0) {
    return {
      score: 50,
      issues: [],
      metadata: { fre: null, gradeLevel: null },
    }
  }

  // Flesch Reading Ease: 206.835 − 1.015 (words/sentences) − 84.6 (syllables/words)
  const fre = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  // Flesch-Kincaid grade level
  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59

  // Map FRE → 0..100 score (90+ very easy, 30 = very difficult)
  const score = Math.max(0, Math.min(100, Math.round(fre + 10)))

  if (fre < 40) {
    issues.push({
      severity: 'high',
      section: 'summary',
      message: 'Reading difficulty is graduate-level — too dense for skimming',
      fix: 'Shorten sentences, avoid stacked nouns, prefer plain Anglo-Saxon verbs',
    })
  } else if (fre < 55) {
    issues.push({
      severity: 'medium',
      section: 'summary',
      message: 'Reading difficulty is high — many recruiters skim in their L2',
      fix: 'Aim for 12–18 word sentences and 1–2 syllable verbs where possible',
    })
  }

  const longSentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim().split(/\s+/).length)
    .filter((n) => n > 30).length
  if (longSentences >= 2) {
    issues.push({
      severity: 'low',
      section: 'workExperience',
      message: `${longSentences} sentences exceed 30 words`,
      fix: 'Break them in two — one idea per sentence',
    })
  }

  return {
    score,
    issues,
    metadata: { fre: round(fre), gradeLevel: round(grade) },
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function round(n: number) {
  return Math.round(n * 10) / 10
}

function countWords(s: string) {
  return s.split(/\s+/).filter(Boolean).length
}

function countSentences(s: string) {
  return s.split(/[.!?]+/).filter((p) => p.trim().length > 0).length
}

function countSyllablesInText(s: string) {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .reduce((sum, w) => sum + countSyllables(w), 0)
}

/** Cheap syllable counter — fine for English readability scoring. */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const cleaned = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
  const matches = cleaned.match(/[aeiouy]{1,2}/g)
  return Math.max(1, matches ? matches.length : 1)
}
