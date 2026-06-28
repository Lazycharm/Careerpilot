/**
 * Per-scorer assertions. We keep each scorer behind an "intent" test (what
 * the scorer is supposed to penalise) rather than chasing exact numbers,
 * which would make these tests brittle.
 */

import { describe, expect, it } from 'vitest'
import { scoreATS, extractKeywords } from '@/lib/ats/scores/ats'
import { scoreRecruiter } from '@/lib/ats/scores/recruiter'
import { scoreReadability } from '@/lib/ats/scores/readability'
import { scoreIndustryMatch } from '@/lib/ats/scores/industryMatch'
import { scoreUAEHiring } from '@/lib/ats/scores/uaeHiring'
import { fullResume, minimalResume, cliCheResume } from '../../fixtures/resume'

describe('scoreATS', () => {
  it('penalises missing identification fields', () => {
    const r = scoreATS(minimalResume)
    const sections = r.issues.map((i) => i.section)
    expect(sections).toContain('personalInfo')
    expect(sections).toContain('workExperience')
    expect(r.score).toBeLessThan(50)
  })

  it('passes a full resume with high score', () => {
    const r = scoreATS(fullResume)
    expect(r.score).toBeGreaterThanOrEqual(85)
  })

  it('reports keyword coverage when JD provided', () => {
    const r = scoreATS(fullResume, 'SAP and supply chain expertise required')
    expect(Array.isArray(r.metadata?.matchedKeywords)).toBe(true)
  })
})

describe('extractKeywords', () => {
  it('strips stopwords and keeps capitalised tokens', () => {
    const out = extractKeywords('We need an Operations Manager with SAP and Excel skills')
    expect(out).toContain('Operations')
    expect(out).toContain('SAP')
    expect(out).not.toContain('we')
    expect(out).not.toContain('and')
  })
})

describe('scoreRecruiter', () => {
  it('rewards quantified bullets and strong verbs', () => {
    const r = scoreRecruiter(fullResume)
    expect(r.score).toBeGreaterThan(70)
    expect((r.metadata?.quantifiedRatio as number) ?? 0).toBeGreaterThan(0.5)
  })

  it('flags AI tells and weak phrases', () => {
    const r = scoreRecruiter(cliCheResume)
    const sections = r.issues.map((i) => i.section)
    expect(sections).toContain('summary')
    expect((r.metadata?.aiTellHits as string[]).length).toBeGreaterThan(0)
    expect((r.metadata?.weakPhraseHits as string[]).length).toBeGreaterThan(0)
  })

  it('returns a low floor when there is no experience text', () => {
    const r = scoreRecruiter(minimalResume)
    expect(r.score).toBeLessThanOrEqual(40)
  })
})

describe('scoreReadability', () => {
  it('returns null FRE for under-50-char input but still gives a score', () => {
    const r = scoreReadability(minimalResume)
    expect(r.metadata?.fre).toBeNull()
    expect(r.score).toBeLessThanOrEqual(40)
  })

  it('returns a numeric FRE for normal prose', () => {
    const r = scoreReadability(fullResume)
    expect(typeof r.metadata?.fre).toBe('number')
    expect(r.score).toBeGreaterThan(30)
  })
})

describe('scoreIndustryMatch', () => {
  it('gives a neutral score when no industry is supplied', () => {
    const r = scoreIndustryMatch(fullResume, null)
    expect(r.score).toBeGreaterThanOrEqual(40)
    expect(r.score).toBeLessThanOrEqual(80)
  })

  it('rewards keyword coverage for a known industry', () => {
    // Fixture has WMS + SAP — matches the curated 'logistics' library.
    const r = scoreIndustryMatch(fullResume, 'logistics')
    expect((r.metadata?.matched as string[]).length).toBeGreaterThan(0)
  })

  it('falls back gracefully on unknown industry', () => {
    const r = scoreIndustryMatch(fullResume, 'underwater-basket-weaving')
    expect(r.issues[0]?.message).toMatch(/no curated keyword library/i)
  })
})

describe('scoreUAEHiring', () => {
  it('rewards UAE phone, Arabic, UAE location', () => {
    const r = scoreUAEHiring(fullResume)
    expect(r.metadata?.hasArabic).toBe(true)
    expect(r.metadata?.uaePhoneFormat).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(75)
  })

  it('penalises rapid job-hopping pattern', () => {
    const hopper = {
      ...fullResume,
      workExperience: [
        {
          company: 'A',
          position: 'X',
          location: 'Dubai',
          startDate: '2024-01',
          endDate: '2024-05',
          current: false,
          description: ['x'],
        },
        {
          company: 'B',
          position: 'X',
          location: 'Dubai',
          startDate: '2023-06',
          endDate: '2023-11',
          current: false,
          description: ['x'],
        },
        {
          company: 'C',
          position: 'X',
          location: 'Dubai',
          startDate: '2022-09',
          endDate: '2023-03',
          current: false,
          description: ['x'],
        },
      ],
    }
    const r = scoreUAEHiring(hopper)
    expect(r.metadata?.shortRoleCount).toBeGreaterThanOrEqual(3)
    expect(r.issues.some((i) => i.message.toLowerCase().includes('short tenures'))).toBe(true)
  })
})
