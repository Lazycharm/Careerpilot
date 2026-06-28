/**
 * Seed script — idempotent.
 *
 * Run with: npm run seed   (or: npx tsx scripts/seed.ts)
 *
 * Seeds:
 * - The 4 production React-PDF templates from lib/pdf/registry.
 * - An admin user from ADMIN_EMAIL / ADMIN_PASSWORD env (creates if missing).
 * - Default platform settings (subscription off, AI on).
 *
 * Safe to re-run; uses upsert and findFirst guards. The previous scripts/setup.ts
 * seeded six templates whose templateKeys (modern-professional, classic-traditional,
 * creative-design, timeline, minimalist, executive) do not exist in the new
 * registry — those rows would render the default fallback. Re-running this seed
 * brings the catalogue back in line with what we actually render.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { TEMPLATE_REGISTRY } from '../lib/pdf/registry'

const prisma = new PrismaClient()

interface TemplateSeed {
  name: string
  category: string
  templateKey: string
  isPremium: boolean
  supportsPhoto: boolean
  description: string
}

function buildTemplateSeeds(): TemplateSeed[] {
  return Object.values(TEMPLATE_REGISTRY).map((t) => ({
    name: t.name,
    category: t.category,
    templateKey: t.key,
    isPremium: t.isPremium,
    supportsPhoto: false, // React-PDF templates are photo-less by design (ATS-safe)
    description: industryHint(t.industries),
  }))
}

function industryHint(industries: string[]): string {
  if (industries.length === 0) return 'General-purpose ATS-safe template'
  return `Best for ${industries.join(', ')}`
}

async function seedTemplates() {
  const seeds = buildTemplateSeeds()
  console.info(`[seed] templates: ${seeds.length} to upsert`)

  for (const seed of seeds) {
    const existing = await prisma.resumeTemplate.findFirst({
      where: { name: seed.name },
    })
    const data = {
      name: seed.name,
      isActive: true,
      supportsPhoto: seed.supportsPhoto,
      isPremium: seed.isPremium,
      category: seed.category,
      metadata: {
        templateKey: seed.templateKey,
        description: seed.description,
      },
    }
    if (existing) {
      await prisma.resumeTemplate.update({ where: { id: existing.id }, data })
      console.info(`  ↻ updated: ${seed.name} → ${seed.templateKey}`)
    } else {
      await prisma.resumeTemplate.create({ data })
      console.info(`  ✓ created: ${seed.name} → ${seed.templateKey}`)
    }
  }
}

async function seedAdmin(): Promise<string> {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      '[seed] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.\n' +
        '       Generate a strong password and add both to .env (NOT .env.example).'
    )
  }
  if (password.length < 12) {
    throw new Error('[seed] ADMIN_PASSWORD must be >= 12 characters.')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.info(`[seed] admin already exists: ${email}`)
    return existing.id
  }

  const hashed = await bcrypt.hash(password, 12)
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: 'Admin',
      role: 'admin',
    },
  })
  console.info(`[seed] admin created: ${email}`)
  return admin.id
}

async function seedSettings(adminId: string) {
  const defaults: Array<{ key: string; value: string; description: string }> = [
    {
      key: 'subscription_enabled',
      value: 'false',
      description: 'Enable subscription gating globally (Phase 3 replaces this).',
    },
    {
      key: 'free_downloads_enabled',
      value: 'true',
      description: 'Phase 1/2: free downloads on while payments are being rebuilt.',
    },
    { key: 'ai_features_enabled', value: 'true', description: 'Master toggle for AI features.' },
    {
      key: 'interview_prep_enabled',
      value: 'true',
      description: 'Master toggle for interview prep module.',
    },
    {
      key: 'resume_download_price',
      value: '5',
      description: 'Per-download price in AED (replaced by Pricing table in Phase 3).',
    },
    {
      key: 'cover_letter_price',
      value: '5',
      description: 'Per-download price in AED (replaced by Pricing table in Phase 3).',
    },
  ]

  for (const s of defaults) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description, updatedBy: adminId },
      create: { key: s.key, value: s.value, description: s.description, updatedBy: adminId },
    })
  }
  console.info(`[seed] settings: ${defaults.length} upserted`)
}

// ── Phase 3: pricing catalogue ─────────────────────────────────────────────

async function seedPricing() {
  const rows: Array<{
    code: string
    name: string
    description: string
    amountFils: number
    durationDays: number | null
    sortOrder: number
    features: Record<string, unknown>
  }> = [
    {
      code: 'free',
      name: 'Free',
      description: '2 basic templates · no cover letter · no ATS optimization',
      amountFils: 0,
      durationDays: null,
      sortOrder: 0,
      features: { downloads: 0, basicTemplates: 2, atsOptimization: false },
    },
    {
      code: 'premium_bundle',
      name: 'Premium Bundle',
      description: '1 professional CV · 1 cover letter · 1 ATS optimization',
      amountFils: 500, // 5 AED
      durationDays: null,
      sortOrder: 10,
      features: { downloads: 1, coverLetter: 1, atsOptimization: 1 },
    },
    {
      code: 'tailored_pack',
      name: 'Tailored Pack',
      description: 'Company-specific CV · free company-specific cover letter',
      amountFils: 500, // 5 AED
      durationDays: null,
      sortOrder: 20,
      features: { tailored: true, includesCoverLetter: true },
    },
    {
      code: 'weekly',
      name: 'Weekly Plan',
      description: '7 days of unlimited downloads and AI features',
      amountFils: 2500, // 25 AED placeholder — admin can edit
      durationDays: 7,
      sortOrder: 30,
      features: { downloads: 'unlimited', atsOptimization: true, ai: true },
    },
    {
      code: 'two_week',
      name: 'Two-Week Plan',
      description: '14 days of unlimited downloads and AI features',
      amountFils: 4000, // 40 AED placeholder
      durationDays: 14,
      sortOrder: 40,
      features: { downloads: 'unlimited', atsOptimization: true, ai: true },
    },
    {
      code: 'monthly',
      name: 'Monthly Plan',
      description: '30 days of unlimited downloads and AI features',
      amountFils: 7500, // 75 AED placeholder
      durationDays: 30,
      sortOrder: 50,
      features: { downloads: 'unlimited', atsOptimization: true, ai: true },
    },
  ]

  for (const r of rows) {
    await prisma.pricing.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        description: r.description,
        amountFils: r.amountFils,
        durationDays: r.durationDays,
        sortOrder: r.sortOrder,
        features: r.features as any,
        isActive: true,
      },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        amountFils: r.amountFils,
        durationDays: r.durationDays,
        sortOrder: r.sortOrder,
        features: r.features as any,
        isActive: true,
      },
    })
  }
  console.info(`[seed] pricing: ${rows.length} upserted`)
}

// ── Phase 3: WhatsApp templates ─────────────────────────────────────────────

async function seedWhatsAppTemplates() {
  const templates = [
    {
      code: 'payment_request',
      name: 'Payment request (user → admin)',
      body:
        'Hi! I\'d like to pay {{amountAED}} AED for the {{planName}} on CareerPilot.\n' +
        'Payment reference: {{paymentId}}\n' +
        'Could you share payment instructions? Thank you!',
    },
    {
      code: 'payment_approved',
      name: 'Payment approved (admin → user)',
      body:
        'Hi {{userName}}, your payment for {{planName}} has been confirmed. Your CareerPilot account is now active — happy job hunting!',
    },
    {
      code: 'payment_rejected',
      name: 'Payment rejected (admin → user)',
      body:
        'Hi {{userName}}, we could not confirm your payment for {{planName}}. Please reply with proof of payment or contact us if you think this is a mistake.',
    },
  ]
  for (const t of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { code: t.code },
      update: { name: t.name, body: t.body, isActive: true },
      create: { code: t.code, name: t.name, body: t.body, isActive: true },
    })
  }
  console.info(`[seed] whatsapp templates: ${templates.length} upserted`)
}

// ── Phase 3: payment toggles + WhatsApp number ──────────────────────────────

async function seedPaymentSettings(adminId: string) {
  const defaults: Array<{ key: string; value: string; description: string }> = [
    {
      key: 'payments.whatsapp.enabled',
      value: 'true',
      description: 'Enable the WhatsApp manual-approval payment rail',
    },
    {
      key: 'payments.whatsapp.adminNumber',
      value: process.env.WHATSAPP_ADMIN_NUMBER ?? '',
      description: 'Admin WhatsApp number in E.164 format that receives payment requests',
    },
    {
      key: 'payments.whatsapp.requestTemplateCode',
      value: 'payment_request',
      description: 'Code of the WhatsApp template used for new payment requests',
    },
    {
      key: 'payments.ziina.enabled',
      value: 'false',
      description: 'Enable the Ziina online payment rail (requires ZIINA_API_KEY)',
    },
    {
      key: 'payments.ziina.testMode',
      value: 'true',
      description: 'Send Ziina intents with test:true (no money moves)',
    },
  ]
  for (const s of defaults) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description, updatedBy: adminId },
      create: { key: s.key, value: s.value, description: s.description, updatedBy: adminId },
    })
  }
  console.info(`[seed] payment settings: ${defaults.length} upserted`)
}

// ── Phase 4: UAE company catalogue ─────────────────────────────────────────

async function seedCompanies() {
  const companies: Array<{
    slug: string
    name: string
    industry: string
    category: string
    hqCity: string
    description: string
  }> = [
    {
      slug: 'carrefour-uae',
      name: 'Carrefour UAE',
      industry: 'retail',
      category: 'hypermarket',
      hqCity: 'Dubai',
      description: 'Hypermarket and grocery chain operated in the UAE by Majid Al Futtaim.',
    },
    {
      slug: 'emirates',
      name: 'Emirates',
      industry: 'aviation',
      category: 'airline',
      hqCity: 'Dubai',
      description: "Dubai-based flag carrier and one of the world's largest airlines by passenger kilometres.",
    },
    {
      slug: 'etihad',
      name: 'Etihad Airways',
      industry: 'aviation',
      category: 'airline',
      hqCity: 'Abu Dhabi',
      description: 'Abu Dhabi-based national airline of the UAE.',
    },
    {
      slug: 'amazon-uae',
      name: 'Amazon.ae',
      industry: 'tech',
      category: 'ecommerce',
      hqCity: 'Dubai',
      description: "Amazon's UAE marketplace, formerly Souq.com.",
    },
    {
      slug: 'noon',
      name: 'Noon',
      industry: 'tech',
      category: 'ecommerce',
      hqCity: 'Riyadh / Dubai',
      description: 'Pan-MENA e-commerce platform headquartered in Riyadh with a major Dubai operation.',
    },
    {
      slug: 'adnoc',
      name: 'ADNOC',
      industry: 'energy',
      category: 'oil-gas',
      hqCity: 'Abu Dhabi',
      description: 'Abu Dhabi National Oil Company — the UAE state-owned energy major.',
    },
    {
      slug: 'emaar',
      name: 'Emaar Properties',
      industry: 'real-estate',
      category: 'developer',
      hqCity: 'Dubai',
      description: 'Real-estate developer behind Burj Khalifa, Dubai Mall, and large master-planned communities.',
    },
    {
      slug: 'etisalat',
      name: 'e& (Etisalat)',
      industry: 'telco',
      category: 'mobile-network',
      hqCity: 'Abu Dhabi',
      description: 'UAE telecommunications and ICT group operating across the Middle East, Africa, and Asia.',
    },
    {
      slug: 'du',
      name: 'du',
      industry: 'telco',
      category: 'mobile-network',
      hqCity: 'Dubai',
      description: 'UAE-based telecommunications operator, owned by Emirates Integrated Telecommunications Company.',
    },
    {
      slug: 'dubai-holding',
      name: 'Dubai Holding',
      industry: 'conglomerate',
      category: 'holding-company',
      hqCity: 'Dubai',
      description: 'Global investment holding company with interests in real estate, hospitality, media, and tech.',
    },
  ]
  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        industry: c.industry,
        category: c.category,
        hqCity: c.hqCity,
        hqCountry: 'UAE',
        description: c.description,
        isActive: true,
      },
      create: {
        slug: c.slug,
        name: c.name,
        industry: c.industry,
        category: c.category,
        hqCity: c.hqCity,
        hqCountry: 'UAE',
        description: c.description,
        isActive: true,
      },
    })
  }
  console.info(`[seed] companies: ${companies.length} upserted`)
}

async function main() {
  console.info('[seed] starting')
  const adminId = await seedAdmin()
  await seedTemplates()
  await seedSettings(adminId)
  await seedPricing()
  await seedWhatsAppTemplates()
  await seedPaymentSettings(adminId)
  await seedCompanies()
  console.info('[seed] done')
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
