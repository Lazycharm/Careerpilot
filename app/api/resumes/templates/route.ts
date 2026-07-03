import { NextResponse } from 'next/server'
import { listHtmlTemplates } from '@/lib/resume/templates/registry'

export const dynamic = 'force-static'

export async function GET() {
  const templates = listHtmlTemplates().map((t) => ({
    id: t.key,
    name: t.name,
    category: t.category,
    isPremium: t.isPremium ?? false,
    supportsPhoto: t.supportsPhoto ?? false,
    accentColor: t.accentColor ?? '#1e3a8a',
    industries: t.industries ?? [],
    isActive: true,
    metadata: { templateKey: t.key },
  }))

  return NextResponse.json(templates)
}

