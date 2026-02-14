import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCoverLetter } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { getSettingAsBoolean } from '@/lib/settings'
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

    // Tier-based AI limit (server-side only)
    await checkAILimit(session.user.id, 'cover_letter')

    // Check if AI features are enabled
    const aiEnabled = await getSettingAsBoolean('ai_features_enabled')
    if (!aiEnabled) {
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      jobTitle, 
      industry, 
      companyName, 
      companyAddress,
      userExperience, 
      resumeId, 
      resumeData,
      contactInfo 
    } = body

    if (!jobTitle || !industry) {
      return NextResponse.json(
        { error: 'Job title and industry are required' },
        { status: 400 }
      )
    }

    // Fetch resume data if resumeId is provided
    let resumeInfo: any = resumeData || null
    if (resumeId && !resumeInfo) {
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: session.user.id,
        },
      })
      if (resume) {
        resumeInfo = resume.data
      }
    }

    // Get user profile for experience if not provided
    let experience = userExperience
    if (!experience) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      })
      experience = profile?.experienceLevel || 'mid'
    }

    const coverLetter = await generateCoverLetter(
      jobTitle,
      industry,
      experience,
      companyName,
      resumeInfo,
      contactInfo,
      companyAddress
    )

    // Save to database
    const saved = await prisma.coverLetter.create({
      data: {
        userId: session.user.id,
        jobTitle,
        industry,
        content: coverLetter,
        aiGenerated: true,
      },
    })

    return NextResponse.json(saved)
  } catch (error: any) {
    console.error('Cover letter generation error:', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}

