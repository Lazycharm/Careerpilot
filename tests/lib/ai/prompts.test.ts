import { describe, expect, it } from 'vitest'
import {
  parseCoverLetterJSON,
  renderCoverLetterJSON,
  coverLetterSystemPrompt,
} from '@/lib/ai/prompts/coverLetter'
import { STYLE_GUARDRAILS, ANTI_AI_TONE } from '@/lib/ai/prompts/style'

describe('parseCoverLetterJSON', () => {
  it('parses a well-formed payload', () => {
    const json = parseCoverLetterJSON(
      JSON.stringify({
        greeting: 'Dear Hiring Manager,',
        opening: 'I am applying for the Operations Manager role.',
        body: ['Para 1', 'Para 2'],
        closing: 'Looking forward to a conversation.',
        sign_off: 'Sincerely,',
        candidate_signature: 'Yasmin Khan',
      })
    )
    expect(json.body).toHaveLength(2)
    expect(json.candidate_signature).toBe('Yasmin Khan')
  })

  it('strips markdown fences if the provider added them', () => {
    const json = parseCoverLetterJSON(
      '```json\n{"greeting":"Hi,","opening":"","body":[],"closing":"","sign_off":"Sincerely,"}\n```'
    )
    expect(json.greeting).toBe('Hi,')
  })

  it('falls back to a single body paragraph on invalid JSON', () => {
    const json = parseCoverLetterJSON('not json at all')
    expect(json.body[0]).toBe('not json at all')
    expect(json.greeting).toBe('Dear Hiring Manager,')
  })
})

describe('renderCoverLetterJSON', () => {
  it('joins paragraphs with double newlines and renders signature block', () => {
    const out = renderCoverLetterJSON({
      greeting: 'Dear Hiring Manager,',
      opening: 'Opening sentence.',
      body: ['Body para 1.', 'Body para 2.'],
      closing: 'Closing sentence.',
      sign_off: 'Sincerely,',
      candidate_signature: 'Yasmin Khan',
    })
    expect(out).toContain('Dear Hiring Manager,\n\nOpening sentence.')
    expect(out).toContain('Body para 1.\n\nBody para 2.')
    expect(out.endsWith('Sincerely,\nYasmin Khan')).toBe(true)
  })

  it('skips empty fields cleanly', () => {
    const out = renderCoverLetterJSON({
      greeting: 'Dear Hiring Manager,',
      opening: '',
      body: [],
      closing: '',
      sign_off: 'Sincerely,',
    })
    expect(out).toBe('Dear Hiring Manager,\n\nSincerely,')
  })
})

describe('coverLetterSystemPrompt', () => {
  it('embeds the shared style guardrails and anti-AI tone block', () => {
    const sys = coverLetterSystemPrompt('professional')
    expect(sys).toContain(STYLE_GUARDRAILS)
    expect(sys).toContain(ANTI_AI_TONE)
  })

  it('declares JSON output contract', () => {
    const sys = coverLetterSystemPrompt('warm')
    expect(sys.toLowerCase()).toContain('respond with valid json only')
  })
})
