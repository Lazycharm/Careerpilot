import { prisma } from './prisma'

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key },
  })
  return setting?.value || null
}

export async function getSettingAsBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
  const value = await getSetting(key)
  if (value === null) {
    // If setting doesn't exist, return default value
    // For new AI settings, default to true if master AI toggle is enabled
    if ((key.startsWith('resume_ai_') || key === 'ai_features_enabled') && defaultValue === false) {
      const masterAI = await getSetting('ai_features_enabled')
      // If master AI is enabled and this is a resume AI setting, default to true
      if (key.startsWith('resume_ai_') && (masterAI === 'true' || masterAI === '1')) {
        return true
      }
    }
    return defaultValue
  }
  return value === 'true' || value === '1'
}

export async function getSettingAsNumber(key: string): Promise<number> {
  const value = await getSetting(key)
  return value ? parseFloat(value) : 0
}

export async function setSetting(
  key: string,
  value: string,
  description?: string,
  updatedBy: string
): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: {
      value,
      description,
      updatedBy,
      updatedAt: new Date(),
    },
    create: {
      key,
      value,
      description,
      updatedBy,
    },
  })
}

// Initialize default settings
export async function initializeDefaultSettings(adminUserId: string): Promise<void> {
  const defaults = [
    { key: 'subscription_enabled', value: 'false', description: 'Enable subscription system globally' },
    { key: 'subscription_price', value: '100', description: 'Monthly subscription price in AED' },
    { key: 'resume_download_price', value: '50', description: 'Price for resume PDF download in AED' },
    { key: 'cover_letter_price', value: '30', description: 'Price for cover letter download in AED' },
    { key: 'ai_features_enabled', value: 'true', description: 'Enable AI features globally (master toggle)' },
    { key: 'resume_ai_enabled', value: 'true', description: 'Enable AI assistance for resume building' },
    { key: 'resume_ai_summary_enabled', value: 'true', description: 'Enable AI for professional summary generation' },
    { key: 'resume_ai_experience_enabled', value: 'true', description: 'Enable AI for work experience optimization' },
    { key: 'resume_ai_skills_enabled', value: 'true', description: 'Enable AI for skills suggestions' },
    { key: 'free_downloads_enabled', value: 'false', description: 'Allow free downloads for all users' },
    { key: 'interview_prep_enabled', value: 'true', description: 'Enable interview preparation system' },
  ]

  for (const setting of defaults) {
    await setSetting(
      setting.key,
      setting.value,
      setting.description,
      adminUserId
    )
  }
}

