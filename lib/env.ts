/**
 * Environment variable loader with runtime validation.
 *
 * Why: any missing required env should fail at boot, not at the first request
 * that needs it. Type-safe access prevents `process.env.X` typos elsewhere.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const key = env.OPENAI_API_KEY
 *
 * Variables marked `.optional()` are nullable when consumed; gate feature use
 * accordingly (e.g. only attempt Sentry init if SENTRY_DSN is present).
 */

import { z } from 'zod'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
const isTest = process.env.NODE_ENV === 'test'

/**
 * .env files commonly contain `KEY=""` to mark a value as "not set yet".
 * Zod's `.optional()` only accepts `undefined`, so empty strings would fail
 * `.url()` / `.min(32)` validators. These helpers coerce `""` → `undefined`
 * before the inner schema sees it.
 */
function optionalUrl() {
  return z.preprocess(emptyToUndefined, z.string().url().optional())
}
function optionalString() {
  return z.preprocess(emptyToUndefined, z.string().optional())
}
function optionalStringMin(n: number, msg: string) {
  return z.preprocess(emptyToUndefined, z.string().min(n, msg).optional())
}
function optionalEmail() {
  return z.preprocess(emptyToUndefined, z.string().email().optional())
}
function optionalRegex(re: RegExp, msg: string) {
  return z.preprocess(emptyToUndefined, z.string().regex(re, msg).optional())
}
function emptyToUndefined(v: unknown) {
  return typeof v === 'string' && v.trim() === '' ? undefined : v
}

const serverSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Pooled connection used by the app at runtime. With Supabase, this is the
  // pgbouncer URL on port 6543.
  DATABASE_URL: z.string().url(),
  // Direct (non-pooled) connection used by `prisma migrate`. Required when
  // DATABASE_URL points at pgbouncer; optional for non-pooled local DBs.
  DIRECT_URL: optionalUrl(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be >=32 chars'),
  NEXTAUTH_URL: z.string().url(),

  // AI providers — at least one should exist in production; admin can switch.
  ANTHROPIC_API_KEY: optionalString(),
  ANTHROPIC_MODEL_DEFAULT: z.string().default('claude-sonnet-4-6'),
  OPENAI_API_KEY: optionalString(),
  OPENAI_MODEL_DEFAULT: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: optionalUrl(),
  AI_DEMO_MODE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // Payments — Ziina
  ZIINA_API_KEY: optionalString(),
  ZIINA_WEBHOOK_SECRET: optionalString(),
  ZIINA_TEST_MODE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // Payments — WhatsApp
  WHATSAPP_ADMIN_NUMBER: optionalRegex(
    /^\+?\d{8,15}$/,
    'WhatsApp number must be international E.164'
  ),

  // Email
  RESEND_API_KEY: optionalString(),
  RESEND_FROM_EMAIL: optionalEmail(),

  // Storage
  SUPABASE_URL: optionalUrl(),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),
  SUPABASE_STORAGE_BUCKET: z.string().default('careerpilot'),

  // Rate limit / queue
  UPSTASH_REDIS_REST_URL: optionalUrl(),
  UPSTASH_REDIS_REST_TOKEN: optionalString(),

  // Encryption (for pgcrypto-mirroring app-layer fields like phone)
  ENCRYPTION_KEY: optionalStringMin(
    32,
    'ENCRYPTION_KEY must be >=32 chars (base64 of 32 bytes)'
  ),

  // Observability
  SENTRY_DSN: optionalUrl(),
  SENTRY_ENVIRONMENT: optionalString(),

  // Google OAuth (Phase 6 — automation Gmail connections)
  GOOGLE_OAUTH_CLIENT_ID: optionalString(),
  GOOGLE_OAUTH_CLIENT_SECRET: optionalString(),

  // Cron auth token — protects /api/cron/* endpoints from random callers.
  CRON_SECRET: optionalString(),
})

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .preprocess(emptyToUndefined, z.string().url())
    .default('https://careerpilot.ae'),
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl(),
})

type Env = z.infer<typeof serverSchema> & z.infer<typeof publicSchema>

function parseEnv(): Env {
  // During Next.js production build the runtime values may not be present.
  // Skip strict parse and return a permissive object — runtime requests will
  // re-evaluate against real env at boot.
  if (isBuild) {
    return { ...process.env } as unknown as Env
  }

  const serverResult = serverSchema.safeParse(process.env)
  const publicResult = publicSchema.safeParse(process.env)

  if (!serverResult.success || !publicResult.success) {
    const errors = [
      ...(serverResult.success ? [] : serverResult.error.issues),
      ...(publicResult.success ? [] : publicResult.error.issues),
    ]
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')

    if (isTest) {
      // Tests get a permissive object so they don't all fail on missing keys.
      console.warn(`[env] validation issues (test mode, ignored):\n${errors}`)
      return { ...process.env } as unknown as Env
    }

    throw new Error(`[env] invalid environment:\n${errors}`)
  }

  return { ...serverResult.data, ...publicResult.data }
}

export const env: Env = parseEnv()

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'

/** Convenience flags for feature gating without leaking env shape. */
export const features = {
  sentry: Boolean(env.SENTRY_DSN),
  claude: Boolean(env.ANTHROPIC_API_KEY),
  openai: Boolean(env.OPENAI_API_KEY),
  ziina: Boolean(env.ZIINA_API_KEY),
  whatsapp: Boolean(env.WHATSAPP_ADMIN_NUMBER),
  resend: Boolean(env.RESEND_API_KEY),
  upstash: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  supabaseStorage: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
  googleOAuth: Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET),
  cron: Boolean(env.CRON_SECRET),
  encryption: Boolean(env.ENCRYPTION_KEY),
}
