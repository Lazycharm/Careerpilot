// Setup script to initialize database with default templates and settings
// Run with: npx tsx scripts/setup.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting setup...')

  // Create default resume templates
  console.log('📄 Creating resume templates...')
  const templates = [
    {
      name: 'Modern Professional',
      isActive: true,
      supportsPhoto: true,
      isPremium: false,
      category: 'modern',
      metadata: {
        templateKey: 'modern-professional',
        description: 'Clean, contemporary design perfect for tech and creative industries',
      },
    },
    {
      name: 'Classic Traditional',
      isActive: true,
      supportsPhoto: false,
      isPremium: false,
      category: 'classic',
      metadata: {
        templateKey: 'classic-traditional',
        description: 'Timeless design ideal for finance, law, and corporate roles',
      },
    },
    {
      name: 'Creative Design',
      isActive: true,
      supportsPhoto: true,
      isPremium: false,
      category: 'creative',
      metadata: {
        templateKey: 'creative-design',
        description: 'Bold design perfect for designers, artists, and marketing professionals',
      },
    },
    {
      name: 'Timeline',
      isActive: true,
      supportsPhoto: true,
      isPremium: true,
      category: 'modern',
      metadata: {
        templateKey: 'timeline',
        description: 'Chronological layout that tells your career story',
      },
    },
    {
      name: 'Minimalist',
      isActive: true,
      supportsPhoto: false,
      isPremium: false,
      category: 'classic',
      metadata: {
        templateKey: 'minimalist',
        description: 'Ultra-clean design optimized for ATS systems',
      },
    },
    {
      name: 'Executive',
      isActive: true,
      supportsPhoto: true,
      isPremium: true,
      category: 'premium',
      metadata: {
        templateKey: 'executive',
        description: 'Sophisticated design for senior executives and C-level positions',
      },
    },
  ]

  for (const template of templates) {
    const existing = await prisma.resumeTemplate.findFirst({
      where: { name: template.name },
    })
    
    if (!existing) {
      await prisma.resumeTemplate.create({
        data: template,
      })
      console.log(`  ✓ Created template: ${template.name}`)
    } else {
      // Update existing template with new metadata
      await prisma.resumeTemplate.update({
        where: { id: existing.id },
        data: template,
      })
      console.log(`  ↻ Updated template: ${template.name}`)
    }
  }
  console.log('✅ Templates created')

  // Create admin user (if needed)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@careerplatform.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
    })

    // Initialize default settings
    console.log('⚙️ Initializing default settings...')
    const defaults = [
      { key: 'subscription_enabled', value: 'false', description: 'Enable subscription system globally' },
      { key: 'resume_download_price', value: '50', description: 'Price for resume PDF download in AED' },
      { key: 'cover_letter_price', value: '30', description: 'Price for cover letter download in AED' },
      { key: 'ai_features_enabled', value: 'true', description: 'Enable AI features' },
      { key: 'free_downloads_enabled', value: 'false', description: 'Allow free downloads for all users' },
      { key: 'interview_prep_enabled', value: 'true', description: 'Enable interview preparation system' },
    ]

    for (const setting of defaults) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description, updatedBy: admin.id },
        create: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
          updatedBy: admin.id,
        },
      })
    }
    console.log('✅ Settings initialized')
    console.log(`\n📧 Admin credentials:`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
  } else {
    console.log('ℹ️ Admin user already exists')
  }

  console.log('\n✨ Setup complete!')
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

