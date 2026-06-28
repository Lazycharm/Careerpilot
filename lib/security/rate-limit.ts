/**
 * Rate limiting.
 *
 * Uses Upstash Redis + @upstash/ratelimit if configured. In dev (or when
 * Upstash creds are absent) falls back to a no-op limiter so local development
 * is unimpacted.
 *
 * Usage in a route handler:
 *   import { rateLimit, identifyRequest, rateLimited } from '@/lib/security/rate-limit'
 *
 *   export async function POST(req: Request) {
 *     const { success, reset } = await rateLimit('ai').limit(identifyRequest(req))
 *     if (!success) return rateLimited(reset)
 *     ...
 *   }
 */

import { env, features } from '@/lib/env'

type LimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number // epoch ms
}

interface Limiter {
  limit: (identifier: string) => Promise<LimitResult>
}

/** Bucket presets (requests per window). */
const PRESETS = {
  public: { tokens: 60, window: '1 m' as const },
  auth: { tokens: 10, window: '1 m' as const },
  ai: { tokens: 10, window: '1 m' as const },
  payments: { tokens: 10, window: '1 m' as const },
  webhook: { tokens: 100, window: '1 m' as const }, // burstable for Ziina retries
  admin: { tokens: 120, window: '1 m' as const },
}
export type RateBucket = keyof typeof PRESETS

const cachedLimiters: Partial<Record<RateBucket, Limiter>> = {}

function noopLimiter(bucket: RateBucket): Limiter {
  const preset = PRESETS[bucket]
  return {
    async limit() {
      return {
        success: true,
        limit: preset.tokens,
        remaining: preset.tokens,
        reset: Date.now() + 60_000,
      }
    },
  }
}

async function buildUpstashLimiter(bucket: RateBucket): Promise<Limiter> {
  const preset = PRESETS[bucket]
  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(preset.tokens, preset.window),
    analytics: true,
    prefix: `cp:rl:${bucket}`,
  })

  return {
    async limit(id) {
      const r = await rl.limit(id)
      return {
        success: r.success,
        limit: r.limit,
        remaining: r.remaining,
        reset: r.reset,
      }
    },
  }
}

/**
 * Returns a limiter for the given bucket. Idempotent + cached.
 * In environments without Upstash configured this returns a no-op limiter.
 */
export function rateLimit(bucket: RateBucket): Limiter {
  if (cachedLimiters[bucket]) return cachedLimiters[bucket]!

  if (!features.upstash) {
    cachedLimiters[bucket] = noopLimiter(bucket)
    return cachedLimiters[bucket]!
  }

  // Build lazily on first call; safe to await across multiple concurrent calls
  // because limit() is asynchronous.
  const lazy: Limiter = {
    async limit(id) {
      if (!cachedLimiters[bucket] || cachedLimiters[bucket] === lazy) {
        cachedLimiters[bucket] = await buildUpstashLimiter(bucket)
      }
      return cachedLimiters[bucket]!.limit(id)
    },
  }
  cachedLimiters[bucket] = lazy
  return lazy
}

/**
 * Best-effort request identifier.
 * Prefer the authenticated user id from the request (caller passes it as a
 * second arg). Falls back to forwarded IP, then to "anonymous".
 */
export function identifyRequest(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`
  const fwd = req.headers.get('x-forwarded-for') ?? ''
  const ip = fwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon'
  return `ip:${ip}`
}

/**
 * Standard rate-limited response. Includes RFC 6585 Retry-After + RateLimit-*
 * headers so clients can back off cleanly.
 */
export function rateLimited(reset: number): Response {
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return new Response(
    JSON.stringify({
      ok: false,
      error: { code: 'rate_limited', message: 'Too many requests' },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
        'RateLimit-Reset': String(retryAfterSec),
      },
    }
  )
}
