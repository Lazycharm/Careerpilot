/**
 * AI router — resolves the right provider per use-case from the AISetting
 * table, with automatic fallback to a secondary provider on error.
 *
 * Call site stays simple:
 *
 *   const out = await aiGenerate({
 *     useCase: 'cover_letter',
 *     prompt,
 *     json: true,
 *   })
 *
 * The router:
 *   1. Looks up the AISetting row for the use-case (cached for 60 s).
 *   2. Picks the primary provider; falls through to the row's fallback on error.
 *   3. Honors AI_DEMO_MODE which forces the mock provider.
 *   4. Records token usage + duration to AIUsage when a userId is supplied.
 */

import { env, features } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { ClaudeProvider } from './providers/claude'
import { OpenAIProvider } from './providers/openai'
import { MockProvider } from './providers/mock'
import {
  AIProviderError,
  type AIProvider,
  type GenerateInput,
  type GenerateOutput,
  type ProviderCode,
} from './providers/types'

// ── Provider registry (one instance per process) ────────────────────────────
const PROVIDERS: Record<ProviderCode, AIProvider> = {
  claude: new ClaudeProvider(),
  openai: new OpenAIProvider(),
  mock: new MockProvider(),
}

// ── In-memory settings cache (60s TTL) ──────────────────────────────────────
type UseCase =
  | 'cv_summary'
  | 'cv_bullets'
  | 'cover_letter'
  | 'interview_questions'
  | 'interview_feedback'
  | 'ats_feedback'
  | 'tailor_cv'
  | 'tailor_cl'
  | 'application_email'

interface ResolvedSetting {
  primary: ProviderCode
  fallback: ProviderCode
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  isEnabled: boolean
  cachedAt: number
}

const CACHE_TTL_MS = 60_000
const cache = new Map<UseCase, ResolvedSetting>()

async function loadSetting(useCase: UseCase): Promise<ResolvedSetting> {
  const cached = cache.get(useCase)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached

  // AISetting may not be populated yet in fresh installs; treat lookup
  // failure as "no row" and fall back to env-default config.
  let row: any = null
  try {
    row = await prisma.aISetting.findUnique({ where: { useCase } })
  } catch {
    row = null
  }

  const resolved: ResolvedSetting = row
    ? {
        primary: row.provider as ProviderCode,
        fallback: row.fallback as ProviderCode,
        model: row.model,
        temperature: row.temperature,
        maxTokens: row.maxTokens,
        systemPrompt: row.systemPrompt,
        isEnabled: row.isEnabled,
        cachedAt: Date.now(),
      }
    : defaultSetting(useCase)

  cache.set(useCase, resolved)
  return resolved
}

function defaultSetting(useCase: UseCase): ResolvedSetting {
  const primary: ProviderCode = features.claude ? 'claude' : features.openai ? 'openai' : 'mock'
  const fallback: ProviderCode = primary === 'claude' && features.openai ? 'openai' : 'mock'
  return {
    primary,
    fallback,
    model: primary === 'claude' ? env.ANTHROPIC_MODEL_DEFAULT : env.OPENAI_MODEL_DEFAULT,
    temperature: 0.7,
    maxTokens: 1500,
    systemPrompt: '',
    isEnabled: true,
    cachedAt: Date.now(),
  }
}

/** Test/runtime hook to flush the cache (e.g. after admin updates a setting). */
export function clearAISettingCache(useCase?: UseCase): void {
  if (useCase) cache.delete(useCase)
  else cache.clear()
}

// ── Public API ──────────────────────────────────────────────────────────────

export interface RouterRequest {
  useCase: UseCase
  prompt: string
  /** Override the system prompt; otherwise the AISetting row's prompt is used. */
  systemPrompt?: string
  /** Force a JSON response. */
  json?: boolean
  /** Override temperature for one call. */
  temperature?: number
  /** Override max tokens for one call. */
  maxTokens?: number
  /** When supplied, increments AIUsage for the month. */
  userId?: string
}

export interface RouterResult extends GenerateOutput {
  /** True when the fallback provider produced the result. */
  fellBack: boolean
}

export async function aiGenerate(req: RouterRequest): Promise<RouterResult> {
  if (env.AI_DEMO_MODE) {
    return runProvider(PROVIDERS.mock, req, false, undefined)
  }

  const setting = await loadSetting(req.useCase)
  if (!setting.isEnabled) {
    return runProvider(PROVIDERS.mock, req, false, setting)
  }

  // Primary
  try {
    const primary = PROVIDERS[setting.primary]
    if (primary.isAvailable()) {
      const out = await runProvider(primary, req, false, setting)
      await trackUsage(req.userId, req.useCase, out)
      return out
    }
  } catch (err) {
    if (!(err instanceof AIProviderError)) throw err
    // fall through to fallback
    console.warn(
      `[ai.router] primary ${setting.primary} failed for ${req.useCase}: ${err.message}`
    )
  }

  // Fallback
  try {
    const fb = PROVIDERS[setting.fallback]
    if (fb.isAvailable()) {
      const out = await runProvider(fb, req, true, setting)
      await trackUsage(req.userId, req.useCase, out)
      return out
    }
  } catch (err) {
    if (!(err instanceof AIProviderError)) throw err
    console.warn(
      `[ai.router] fallback ${setting.fallback} failed for ${req.useCase}: ${err.message}`
    )
  }

  // Last resort
  const out = await runProvider(PROVIDERS.mock, req, true, setting)
  return out
}

async function runProvider(
  provider: AIProvider,
  req: RouterRequest,
  fellBack: boolean,
  setting: ResolvedSetting | undefined
): Promise<RouterResult> {
  const input: GenerateInput = {
    prompt: req.prompt,
    systemPrompt: req.systemPrompt ?? setting?.systemPrompt,
    temperature: req.temperature ?? setting?.temperature,
    maxTokens: req.maxTokens ?? setting?.maxTokens,
    model: setting?.model,
    json: req.json,
  }
  const out = await provider.generate(input)
  return { ...out, fellBack }
}

async function trackUsage(
  userId: string | undefined,
  useCase: UseCase,
  out: GenerateOutput
): Promise<void> {
  if (!userId) return
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const incrementField = usageFieldFor(useCase)

  try {
    await prisma.aIUsage.upsert({
      where: { userId_month_year: { userId, month, year } },
      update: { [incrementField]: { increment: 1 } },
      create: {
        userId,
        month,
        year,
        [incrementField]: 1,
      },
    })
  } catch (err) {
    console.warn('[ai.router] failed to track usage', err)
  }
}

function usageFieldFor(useCase: UseCase): string {
  // Map use-cases to the AIUsage counters that exist in the live schema.
  // Anything off-axis falls into resumesGenerated to avoid crashing the
  // primary action; richer counters land in Phase 5 with the audit/activity
  // log refactor.
  switch (useCase) {
    case 'cover_letter':
    case 'tailor_cl':
      return 'coverLettersGenerated'
    case 'interview_questions':
    case 'interview_feedback':
      return 'interviewGenerated'
    default:
      return 'resumesGenerated'
  }
}
