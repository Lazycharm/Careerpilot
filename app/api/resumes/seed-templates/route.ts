import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listHtmlTemplates } from '@/lib/resume/templates/registry'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const templateCount = await prisma.resumeTemplate.count()
    const templates = await prisma.resumeTemplate.findMany({
      select: { id: true, name: true, category: true, isPremium: true, isActive: true },
    })
    return NextResponse.json({ currentTemplates: templateCount, templates })
  } catch (error) {
    console.error('Template info error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Derive seed data from the code registry — single source of truth
    const registryTemplates = listHtmlTemplates()
    const templates = registryTemplates.map((t) => ({
      name: t.name,
      previewImage: null as string | null,
      isActive: true,
      supportsPhoto: t.supportsPhoto,
      isPremium: t.isPremium,
      category: t.category,
      metadata: {
        templateKey: t.key,
        accentColor: t.accentColor,
        industries: t.industries,
        description: buildDescription(t.key),
      },
    }))

    const created = await Promise.all(
      templates.map(async (template) => {
        const existing = await prisma.resumeTemplate.findFirst({
          where: { metadata: { path: ['templateKey'], equals: template.metadata.templateKey } },
        })
        if (existing) {
          return prisma.resumeTemplate.update({
            where: { id: existing.id },
            data: template,
          })
        }
        // Fallback: match by name
        const byName = await prisma.resumeTemplate.findFirst({ where: { name: template.name } })
        if (byName) {
          return prisma.resumeTemplate.update({ where: { id: byName.id }, data: template })
        }
        return prisma.resumeTemplate.create({ data: template })
      })
    )

    return NextResponse.json({ message: 'Templates seeded successfully', count: created.length })
  } catch (error) {
    console.error('Template seed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'dubai-classic': 'Classic navy blue, ATS-optimized, perfect for corporate and banking roles in Dubai',
    'sharjah-minimal': 'Ultra-clean monochrome, maximum whitespace, ideal for tech and design',
    'abu-dhabi-executive': 'Premium serif with optional photo, burgundy accent, for senior leadership',
    'gulf-modern': 'Contemporary Poppins font with teal accent and skill pills',
    'uae-banking': 'Double-rule header, formal navy, for UAE banking and finance professionals',
    'uae-tech': 'Dark sidebar with blue accent, JetBrains Mono labels for tech engineers',
    'uae-hospitality': 'Warm amber gradient header, Playfair serif, for hospitality professionals',
    'uae-healthcare': 'Clean teal left-border layout for UAE healthcare and medical staff',
    'uae-government': 'Formal navy with block section titles for UAE public sector roles',
    'uae-creative': 'Violet gradient sidebar with pill skills for creative professionals',
    'uae-marketing': 'Purple gradient clip-path header, Poppins for marketing and digital roles',
    'uae-startup': 'Bold orange accent, metrics-first layout for startup and business dev',
    'uae-photo-executive': 'Gold Cormorant Garamond serif with photo for C-suite executives',
    'uae-legal': 'Conservative Lora serif with double rule for legal and compliance professionals',
    'uae-retail': 'Fresh emerald green header, Nunito font for retail and customer service',
    'uae-education': 'Academic Source Serif with teaching-focused sections',
    'uae-gold': 'Dark header with gold gradient rule — luxury and premium roles',
    'uae-photo-modern': 'Teal header with photo placeholder for business and management roles',
    'uae-desert': 'Warm terracotta gradient header with diamond decorations — premium UAE aesthetic',
    'ats-pure': 'Pure ATS: Arial only, no colors, no columns — maximum ATS parse score',
    'ats-professional': 'ATS-safe with clean double rule, Calibri-style, human-readable too',
    'ats-finance': 'ATS optimized for UAE banking ATS (ADCB, FAB, Emirates NBD)',
    'ats-tech': 'Technical skills first, keyword-dense for UAE tech company ATS',
    'ats-management': 'Achievement-focused ATS for UAE management and director roles',
  }
  return descriptions[key] || `${key} — professional resume template`
}
