/**
 * Mock provider — deterministic canned responses for dev / CI / demos.
 *
 * Picked automatically when AI_DEMO_MODE is set, and used as the safety net
 * by the router when neither Claude nor OpenAI is configured.
 */

import type { AIProvider, GenerateInput, GenerateOutput } from './types'

export class MockProvider implements AIProvider {
  readonly code = 'mock' as const

  isAvailable(): boolean {
    return true
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const start = Date.now()
    // Small artificial latency so tests can assert durationMs is non-zero.
    await new Promise((r) => setTimeout(r, 5))

    const text = input.json
      ? JSON.stringify(buildJsonResponse(input.prompt))
      : buildTextResponse(input.prompt)

    return {
      text,
      provider: 'mock',
      model: 'mock-1',
      inputTokens: Math.ceil(input.prompt.length / 4),
      outputTokens: Math.ceil(text.length / 4),
      durationMs: Date.now() - start,
    }
  }
}

function buildTextResponse(prompt: string): string {
  if (/cover letter/i.test(prompt)) {
    return [
      'Dear Hiring Manager,',
      '',
      'I am writing to express my interest in the role you advertised. My background combines hands-on delivery with a record of measurable outcomes, and I would welcome the chance to bring that to your team.',
      '',
      'In my last role I owned end-to-end delivery of three flagship initiatives, working closely with operations and product partners to ship on time and under budget. I would be glad to share specifics in an interview.',
      '',
      'Thank you for your consideration.',
      '',
      'Sincerely,',
      '[Your Name]',
    ].join('\n')
  }
  if (/summary|professional/i.test(prompt)) {
    return 'Operations-minded professional with seven years of UAE-based experience leading cross-functional teams. Known for turning ambiguous goals into shipped outcomes, and for clear written communication across multicultural teams.'
  }
  if (/bullet|experience/i.test(prompt)) {
    return [
      'Led the launch of a new customer onboarding workflow that cut activation time from 14 days to 4.',
      'Built and ran a weekly operating review that became the team\'s default planning tool.',
      'Recovered a stalled vendor relationship after renegotiating terms, saving the team 18 hours per month.',
    ].join('\n')
  }
  return 'This is a mock response. Set ANTHROPIC_API_KEY or OPENAI_API_KEY to use a real provider.'
}

function buildJsonResponse(prompt: string): unknown {
  if (/cover letter/i.test(prompt)) {
    return {
      greeting: 'Dear Hiring Manager,',
      opening: 'I am writing to express interest in the role you advertised.',
      body: [
        'My background combines hands-on delivery with measurable outcomes.',
        'In my last role I owned end-to-end delivery of three flagship initiatives.',
      ],
      closing: 'I would welcome the chance to discuss this further.',
      sign_off: 'Sincerely,',
    }
  }
  return { ok: true, note: 'mock json response' }
}
