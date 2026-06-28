import { describe, expect, it } from 'vitest'
import { analyzeResume } from '@/lib/ats'
import { fullResume, minimalResume, cliCheResume } from '../../fixtures/resume'

describe('analyzeResume', () => {
  it('returns all 5 scores for a complete resume', () => {
    // Fixture is an Operations Manager with supply-chain/WMS/SAP background —
    // matches the curated 'logistics' keyword library more naturally than 'retail'.
    const r = analyzeResume({ data: fullResume, industry: 'logistics' })
    expect(r.scores.ats).toBeGreaterThan(70)
    expect(r.scores.recruiter).toBeGreaterThan(60)
    expect(r.scores.readability).toBeGreaterThan(40)
    expect(r.scores.industryMatch).toBeGreaterThan(40)
    expect(r.scores.uaeHiring).toBeGreaterThan(70)
  })

  it('penalises an empty resume across multiple scorers', () => {
    const r = analyzeResume({ data: minimalResume })
    expect(r.scores.ats).toBeLessThan(50)
    expect(r.issues.some((i) => i.severity === 'high')).toBe(true)
    // High-severity issues sort first
    expect(r.issues[0]?.severity).toBe('high')
  })

  it('flags AI clichés and weak phrasing', () => {
    const r = analyzeResume({ data: cliCheResume })
    const messages = r.issues.map((i) => i.message.toLowerCase())
    expect(messages.some((m) => m.includes('ai-generated'))).toBe(true)
    expect(messages.some((m) => m.includes('generic phrasing'))).toBe(true)
    expect(r.scores.recruiter).toBeLessThan(70)
  })

  it('deduplicates identical issues across scorers', () => {
    const r = analyzeResume({ data: minimalResume })
    const keys = r.issues.map((i) => `${i.section}::${i.message}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('reports JD-driven keyword coverage when a description is provided', () => {
    const jd =
      'We are hiring an Operations Manager with experience in SAP, vendor management, and supply chain forecasting.'
    const r = analyzeResume({ data: fullResume, industry: 'retail', jobDescription: jd })
    expect(r.keywords.matched.length).toBeGreaterThan(0)
    expect(r.meta.jobDescriptionProvided).toBe(true)
  })
})
