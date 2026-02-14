import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { optimizeResumeForATS } from '@/lib/ai/resumeOptimizer'
import { getSettingAsBoolean } from '@/lib/settings'

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
    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { resumeContent, jobTitle, industry } = body

    if (!resumeContent) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      )
    }

    const optimized = await optimizeResumeForATS(
      resumeContent,
      jobTitle,
      industry
    )

    return NextResponse.json({ optimizedContent: optimized })
  } catch (error: any) {
    console.error('Resume optimization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to optimize resume' },
      { status: 500 }
    )
  }
}

