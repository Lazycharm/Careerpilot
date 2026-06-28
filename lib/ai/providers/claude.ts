/**
 * Anthropic Claude provider.
 *
 * Uses the Messages API directly via fetch — no SDK dependency. Keeps the
 * deploy lean and the dependency surface small. JSON mode is requested via
 * the system prompt instruction; Claude reliably returns JSON when told to
 * "respond with valid JSON only".
 *
 * Docs: https://docs.claude.com/en/api/messages
 */

import { env } from '@/lib/env'
import { AIProviderError, type AIProvider, type GenerateInput, type GenerateOutput } from './types'

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

export class ClaudeProvider implements AIProvider {
  readonly code = 'claude' as const

  isAvailable(): boolean {
    return Boolean(env.ANTHROPIC_API_KEY)
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const apiKey = env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new AIProviderError('ANTHROPIC_API_KEY is not set', 'claude')
    }

    const model = input.model ?? env.ANTHROPIC_MODEL_DEFAULT
    const start = Date.now()

    const systemPrompt = buildSystemPrompt(input.systemPrompt, input.json)

    let resp: Response
    try {
      resp = await fetch(CLAUDE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model,
          max_tokens: input.maxTokens ?? 1500,
          temperature: input.temperature ?? 0.7,
          system: systemPrompt,
          messages: [{ role: 'user', content: input.prompt }],
        }),
      })
    } catch (err) {
      throw new AIProviderError(
        `Network error calling Claude: ${(err as Error).message}`,
        'claude',
        undefined,
        true
      )
    }

    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      throw new AIProviderError(
        `Claude API ${resp.status}: ${body.slice(0, 500)}`,
        'claude',
        resp.status,
        resp.status >= 500 || resp.status === 429
      )
    }

    const data = (await resp.json()) as ClaudeResponse
    const text = data.content?.find((c) => c.type === 'text')?.text?.trim() ?? ''

    return {
      text,
      provider: 'claude',
      model,
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      durationMs: Date.now() - start,
    }
  }
}

function buildSystemPrompt(custom: string | undefined, json: boolean | undefined): string {
  const base = custom?.trim() ?? ''
  if (!json) return base || ' '
  const jsonClause = 'Respond with valid JSON only. No markdown fences, no prose.'
  return base ? `${base}\n\n${jsonClause}` : jsonClause
}

interface ClaudeResponse {
  content?: Array<{ type: string; text?: string }>
  usage?: { input_tokens?: number; output_tokens?: number }
}
