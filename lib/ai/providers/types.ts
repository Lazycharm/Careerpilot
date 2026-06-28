/**
 * Provider-neutral types for the AI router.
 *
 * Every concrete provider (Claude, OpenAI, Mock) implements `AIProvider`.
 * The router picks one per use-case based on the AISetting table and falls
 * back to a second provider on error or empty response.
 */

export type ProviderCode = 'claude' | 'openai' | 'mock'

export interface GenerateInput {
  /** Plain-text prompt. For structured output, the JSON schema is part of the system prompt. */
  prompt: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  /**
   * When true, the provider is instructed to return JSON. Caller is responsible
   * for parsing. Implementations should pass through whatever JSON-mode flag
   * the underlying API offers.
   */
  json?: boolean
}

export interface GenerateOutput {
  /** Raw text from the provider. */
  text: string
  /** Provider that actually produced this output (may differ from request if fallback fired). */
  provider: ProviderCode
  model: string
  /** Best-effort token accounting (0 if the provider does not report it). */
  inputTokens: number
  outputTokens: number
  /** Wall-clock duration in milliseconds. */
  durationMs: number
}

export interface AIProvider {
  readonly code: ProviderCode
  isAvailable(): boolean
  generate(input: GenerateInput): Promise<GenerateOutput>
}

/** Thrown when a provider call fails for a reason the router should respect. */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: ProviderCode,
    public readonly status?: number,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}
