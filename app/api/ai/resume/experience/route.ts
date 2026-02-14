import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettingAsBoolean } from '@/lib/settings'
import { optimizeExperienceBullets } from '@/lib/ai/resumeAssistant'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await checkAILimit(session.user.id, 'resume')

    const aiEnabled = await getSettingAsBoolean('ai_features_enabled', true)
    const resumeAIEnabled = await getSettingAsBoolean('resume_ai_enabled', true)
    const experienceAIEnabled = await getSettingAsBoolean('resume_ai_experience_enabled', true)
    
    if (!aiEnabled || !resumeAIEnabled || !experienceAIEnabled) {
      return NextResponse.json(
        { error: 'AI experience optimization is currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { company, position, description, jobTitle, industry } = body

    if (!company || !position || !Array.isArray(description)) {
      return NextResponse.json(
        { error: 'Company, position, and description array are required' },
        { status: 400 }
      )
    }

    const optimizedBullets = await optimizeExperienceBullets({
      company,
      position,
      currentDescription: description,
      jobTitle,
      industry,
    })

    await incrementAIUsage(session.user.id, 'resume')

    return NextResponse.json({ bullets: optimizedBullets })
  } catch (error: any) {
    console.error('Experience optimization error:', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to optimize experience' },
      { status: 500 }
    )
  }
}

