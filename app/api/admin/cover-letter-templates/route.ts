import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listCLTemplates } from '@/lib/coverLetter/templates/registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'admin') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const registryTemplates = listCLTemplates()

    // Get per-template usage counts from cover_letters table
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get enabled/disabled overrides from settings (stored as JSON in settings table)
    let disabledKeys: string[] = []
    try {
      const setting = await prisma.setting.findUnique({ where: { key: 'cl_template_disabled_keys' } })
      if (setting) disabledKeys = JSON.parse(setting.value)
    } catch { /* no overrides yet */ }

    const [totalCount, monthCount] = await Promise.all([
      prisma.coverLetter.count(),
      prisma.coverLetter.count({ where: { createdAt: { gte: monthStart } } }),
    ])

    const templates = registryTemplates.map(t => ({
      key: t.key,
      name: t.name,
      description: t.description,
      accentColor: t.accentColor,
      isPremium: t.isPremium,
      usageCount: 0, // Would need a templateKey field on CoverLetter to track precisely
      isEnabled: !disabledKeys.includes(t.key),
    }))

    return NextResponse.json({
      templates,
      stats: { total: totalCount, thisMonth: monthCount },
    })
  } catch (error) {
    console.error('CL templates GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { key, isEnabled } = await req.json()
    if (!key || typeof isEnabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Read current disabled keys
    let disabledKeys: string[] = []
    try {
      const setting = await prisma.setting.findUnique({ where: { key: 'cl_template_disabled_keys' } })
      if (setting) disabledKeys = JSON.parse(setting.value)
    } catch { /* none yet */ }

    if (isEnabled) {
      disabledKeys = disabledKeys.filter(k => k !== key)
    } else {
      if (!disabledKeys.includes(key)) disabledKeys.push(key)
    }

    await prisma.setting.upsert({
      where: { key: 'cl_template_disabled_keys' },
      create: {
        key: 'cl_template_disabled_keys',
        value: JSON.stringify(disabledKeys),
        description: 'Cover letter template keys that are disabled for users',
        updatedBy: session.user.id,
      },
      update: {
        value: JSON.stringify(disabledKeys),
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CL templates PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
