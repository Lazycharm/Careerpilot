/**
 * /api/admin/ai-settings
 *
 * GET → list the AISetting row per use-case. Missing rows render as defaults
 *       so the admin UI can populate the matrix without empty cells.
 * PUT → bulk upsert. Body: { settings: [{ useCase, provider, fallback, model, ... }] }
 *
 * Cache invalidation: lib/ai/router.ts caches AISetting reads for 60s. Admin
 * edits clear that cache via `clearAISettingCache()` so changes take effect
 * within the same process boot.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit, auditContext } from '@/lib/security/audit'
import { clearAISettingCache } from '@/lib/ai/router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const USE_CASES = [
  'cv_summary',
  'cv_bullets',
  'cover_letter',
  'interview_questions',
  'interview_feedback',
  'ats_feedback',
  'tailor_cv',
  'tailor_cl',
  'application_email',
] as const

const PROVIDERS = ['claude', 'openai', 'mock'] as const

const SettingInput = z.object({
  useCase: z.enum(USE_CASES),
  provider: z.enum(PROVIDERS),
  fallback: z.enum(PROVIDERS),
  model: z.string().trim().min(1).max(60),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(64).max(8000),
  systemPrompt: z.string().max(8000).default(''),
  isEnabled: z.boolean().default(true),
})

const PutBody = z.object({
  settings: z.array(SettingInput).min(1).max(USE_CASES.length),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await prisma.aISetting.findMany({ orderBy: { useCase: 'asc' } })
  return NextResponse.json({ items: rows, knownUseCases: USE_CASES })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const parsed = PutBody.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const results = []
  for (const s of parsed.data.settings) {
    const row = await prisma.aISetting.upsert({
      where: { useCase: s.useCase },
      update: {
        provider: s.provider,
        fallback: s.fallback,
        model: s.model,
        temperature: s.temperature,
        maxTokens: s.maxTokens,
        systemPrompt: s.systemPrompt,
        isEnabled: s.isEnabled,
      },
      create: {
        useCase: s.useCase,
        provider: s.provider,
        fallback: s.fallback,
        model: s.model,
        temperature: s.temperature,
        maxTokens: s.maxTokens,
        systemPrompt: s.systemPrompt,
        isEnabled: s.isEnabled,
      },
    })
    results.push(row)
    clearAISettingCache(s.useCase)
  }

  await audit({
    actorId: session.user.id,
    action: 'ai_setting.bulk_upsert',
    target: 'ai_settings',
    after: { useCases: results.map((r) => r.useCase) },
    ...auditContext(req),
  })

  return NextResponse.json({ items: results })
}
