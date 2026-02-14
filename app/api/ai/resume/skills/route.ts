import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettingAsBoolean } from '@/lib/settings'
import { suggestSkills } from '@/lib/ai/resumeAssistant'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if AI features are enabled
    // Default to true if setting doesn't exist (for backward compatibility)
    const aiEnabled = await getSettingAsBoolean('ai_features_enabled', true)
    const resumeAIEnabled = await getSettingAsBoolean('resume_ai_enabled', true)
    const skillsAIEnabled = await getSettingAsBoolean('resume_ai_skills_enabled', true)
    
    if (!aiEnabled || !resumeAIEnabled || !skillsAIEnabled) {
      return NextResponse.json(
        { error: 'AI skills suggestions are currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobTitle, industry, currentSkills, experienceLevel } = body

    const suggestedSkills = await suggestSkills({
      jobTitle,
      industry,
      currentSkills,
      experienceLevel,
    })

    return NextResponse.json({ skills: suggestedSkills })
  } catch (error: any) {
    console.error('Skills suggestion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to suggest skills' },
      { status: 500 }
    )
  }
}

