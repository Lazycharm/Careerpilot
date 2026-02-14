import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Resumes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, templateId } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Use provided templateId or get default template
    let finalTemplateId = templateId
    
    if (!finalTemplateId) {
      // Get default template if none provided
      const defaultTemplate = await prisma.resumeTemplate.findFirst({
        where: { isActive: true },
      })
      
      if (!defaultTemplate) {
        return NextResponse.json(
          { error: 'No active templates available' },
          { status: 400 }
        )
      }
      finalTemplateId = defaultTemplate.id
    } else {
      // Verify the provided template exists and is active
      const template = await prisma.resumeTemplate.findFirst({
        where: { 
          id: finalTemplateId,
          isActive: true 
        },
      })
      
      if (!template) {
        return NextResponse.json(
          { error: 'Selected template not found or inactive' },
          { status: 400 }
        )
      }
    }

    const resume = await prisma.resume.create({
      data: {
        title,
        templateId: finalTemplateId,
        userId: session.user.id,
        data: {
          personalInfo: {
            fullName: '',
            email: session.user.email || '',
            phone: '',
            location: '',
          },
          summary: '',
          workExperience: [],
          education: [],
          skills: [],
          certifications: [],
          languages: [],
        },
        status: 'draft',
      },
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error('Resume creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

