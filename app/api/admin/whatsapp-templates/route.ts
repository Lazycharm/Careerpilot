/**
 * /api/admin/whatsapp-templates
 *
 * GET → list all templates.
 * PUT → bulk upsert by code. Body: { templates: [{ code, name, body, isActive? }] }
 *       Lets admin edit multiple at once from a single form.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit, auditContext } from '@/lib/security/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TemplateInput = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_]+$/i),
  name: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000),
  isActive: z.boolean().optional(),
})

const PutBody = z.object({
  templates: z.array(TemplateInput).min(1).max(20),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const items = await prisma.whatsAppTemplate.findMany({
    orderBy: { code: 'asc' },
  })
  return NextResponse.json({ items })
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
  for (const t of parsed.data.templates) {
    const row = await prisma.whatsAppTemplate.upsert({
      where: { code: t.code },
      update: { name: t.name, body: t.body, isActive: t.isActive ?? true },
      create: {
        code: t.code,
        name: t.name,
        body: t.body,
        isActive: t.isActive ?? true,
      },
    })
    results.push(row)
  }

  await audit({
    actorId: session.user.id,
    action: 'whatsapp_template.bulk_upsert',
    target: 'whatsapp_templates',
    after: { codes: results.map((r) => r.code) },
    ...auditContext(req),
  })
  return NextResponse.json({ items: results })
}
