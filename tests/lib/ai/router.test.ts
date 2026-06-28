/**
 * Router fallback test.
 *
 * The router is hard to test against the real Claude/OpenAI without API keys.
 * We exercise the fallback path by ensuring that when neither paid provider
 * is available (AI_DEMO_MODE on), the mock provider is selected and produces
 * non-empty output. That covers the bottom rung of the fallback chain.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('aiGenerate (mock route)', () => {
  let originalDemo: string | undefined

  beforeAll(() => {
    originalDemo = process.env.AI_DEMO_MODE
    process.env.AI_DEMO_MODE = 'true'
  })

  afterAll(() => {
    if (originalDemo === undefined) delete process.env.AI_DEMO_MODE
    else process.env.AI_DEMO_MODE = originalDemo
  })

  it('returns mock output when demo mode is enabled', async () => {
    const { aiGenerate } = await import('@/lib/ai/router')
    const out = await aiGenerate({
      useCase: 'cover_letter',
      prompt: 'Write a cover letter for a UAE retail role',
      json: true,
    })
    expect(out.provider).toBe('mock')
    expect(out.text.length).toBeGreaterThan(0)
    expect(out.durationMs).toBeGreaterThanOrEqual(0)
  })
})
