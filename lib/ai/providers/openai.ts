/**
 * OpenAI Chat Completions provider.
 *
 * Lean: uses fetch, no SDK. JSON mode requested via `response_format`. Honors
 * OPENAI_BASE_URL for Azure/proxy setups.
 */

import { env } from '@/lib/env'
import { AIProviderError, type AIProvider, type GenerateInput, type GenerateOutput } from './types'

export class OpenAIProvider implements AIProvider {
  readonly code = 'openai' as const

  isAvailable(): boolean {
    return Boolean(env.OPENAI_API_KEY)
  }

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const apiKey = env.OPENAI_API_KEY
    if (!apiKey) {
      throw new AIProviderError('OPENAI_API_KEY is not set', 'openai')
    }

    const baseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const model = input.model ?? env.OPENAI_MODEL_DEFAULT
    const start = Date.now()

    const messages: Array<{ role: 'system' | 'user'; content: string }> = []
    if (input.systemPrompt?.trim()) {
      messages.push({ role: 'system', content: input.systemPrompt.trim() })
    }
    messages.push({ role: 'user', content: input.prompt })

    let resp: Response
    try {
      resp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: input.maxTokens ?? 1500,
          temperature: input.temperature ?? 0.7,
          ...(input.json ? { response_format: { type: 'json_object' } } : {}),
        }),
      })
    } catch (err) {
      throw new AIProviderError(
        `Network error calling OpenAI: ${(err as Error).message}`,
        'openai',
        undefined,
        true
      )
    }

    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      throw new AIProviderError(
        `OpenAI API ${resp.status}: ${body.slice(0, 500)}`,
        'openai',
        resp.status,
        resp.status >= 500 || resp.status === 429
      )
    }

    const data = (await resp.json()) as OpenAIResponse
    const text = data.choices?.[0]?.message?.content?.trim() ?? ''

    return {
      text,
      provider: 'openai',
      model,
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      durationMs: Date.now() - start,
    }
  }
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>
  usage?: { prompt_tokens?: number; completion_tokens?: number }
}
