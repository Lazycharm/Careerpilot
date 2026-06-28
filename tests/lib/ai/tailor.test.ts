import { describe, expect, it } from 'vitest'
import {
  applyTailorEdits,
  parseTailorCVOutput,
} from '@/lib/ai/prompts/tailorCV'

describe('parseTailorCVOutput', () => {
  it('parses a well-formed payload', () => {
    const json = JSON.stringify({
      summary: 'New summary',
      workExperience: [{ matchOn: { company: 'X' }, bullets: ['a', 'b'] }],
      addSkills: ['Excel', 'SAP'],
      rationale: 'Why',
    })
    const out = parseTailorCVOutput(json)
    expect(out.summary).toBe('New summary')
    expect(out.workExperience?.length).toBe(1)
    expect(out.addSkills).toEqual(['Excel', 'SAP'])
    expect(out.rationale).toBe('Why')
  })

  it('strips markdown fences', () => {
    const out = parseTailorCVOutput('```json\n{"summary":"S"}\n```')
    expect(out.summary).toBe('S')
  })

  it('returns empty object on garbage input', () => {
    const out = parseTailorCVOutput('not json')
    expect(out).toEqual({})
  })

  it('filters empty strings from addSkills', () => {
    const out = parseTailorCVOutput(JSON.stringify({ addSkills: ['a', '', '  '] }))
    expect(out.addSkills).toEqual(['a'])
  })
})

describe('applyTailorEdits', () => {
  const base = {
    summary: 'Old',
    workExperience: [
      { company: 'Carrefour UAE', position: 'Ops', description: ['old bullet'] },
      { company: 'Noon', position: 'Analyst', description: ['noon bullet'] },
    ],
    skills: [{ category: 'Core', items: ['Excel'] }],
  }

  it('overrides summary when present', () => {
    const out = applyTailorEdits(base, { summary: 'New' })
    expect(out.summary).toBe('New')
  })

  it('replaces bullets only on matched roles', () => {
    const out = applyTailorEdits(base, {
      workExperience: [
        { matchOn: { company: 'Carrefour UAE' }, bullets: ['rebuilt'] },
      ],
    })
    expect(out.workExperience[0].description).toEqual(['rebuilt'])
    expect(out.workExperience[1].description).toEqual(['noon bullet'])
  })

  it('appends new skills without duplicates (case-insensitive)', () => {
    const out = applyTailorEdits(base, { addSkills: ['SAP', 'excel'] })
    expect(out.skills[0].items).toEqual(['Excel', 'SAP'])
  })

  it('creates a skills group if the source has none', () => {
    const out = applyTailorEdits(
      { ...base, skills: [] },
      { addSkills: ['Power BI'] }
    )
    expect(out.skills[0]).toEqual({ category: 'Skills', items: ['Power BI'] })
  })

  it('does not mutate the input object', () => {
    const original = JSON.parse(JSON.stringify(base))
    applyTailorEdits(base, { summary: 'X' })
    expect(base).toEqual(original)
  })
})
