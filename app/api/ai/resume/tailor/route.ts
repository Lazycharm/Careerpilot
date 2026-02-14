import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettingAsBoolean } from '@/lib/settings'
import { tailorResumeForJob } from '@/lib/ai/resumeAssistant'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'
import type { ResumeData } from '@/types'

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
    
    if (!aiEnabled || !resumeAIEnabled) {
      return NextResponse.json(
        { error: 'AI resume tailoring is currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobTitle, jobDescription, company, industry, currentResume } = body

    if (!jobTitle || !currentResume) {
      return NextResponse.json(
        { error: 'Job title and current resume data are required' },
        { status: 400 }
      )
    }

    const tailored = await tailorResumeForJob({
      jobTitle,
      jobDescription,
      company,
      industry,
      currentResume: currentResume as ResumeData,
    })

    await incrementAIUsage(session.user.id, 'resume')

    return NextResponse.json({ tailored })
  } catch (error: any) {
    console.error('Resume tailoring error:', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to tailor resume' },
      { status: 500 }
    )
  }
}

