import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        template: true,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Resume fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, data, status, templateId } = body

    // Calculate word count
    const wordCount = data ? calculateWordCount(data) : undefined

    // If templateId is provided, verify it exists
    if (templateId) {
      const template = await prisma.resumeTemplate.findFirst({
        where: { 
          id: templateId,
          isActive: true 
        },
      })
      
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found or inactive' },
          { status: 400 }
        )
      }
    }

    const resume = await prisma.resume.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(title && { title }),
        ...(data && { data }),
        ...(status && { status }),
        ...(templateId && { templateId }),
        ...(wordCount !== undefined && { wordCount }),
      },
      include: {
        template: true,
      },
    })

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Resume update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.resume.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Resume deleted' })
  } catch (error) {
    console.error('Resume delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateWordCount(data: any): number {
  if (!data) return 0

  let text = ''
  if (data.summary) text += data.summary + ' '
  if (data.personalInfo) {
    text += JSON.stringify(data.personalInfo) + ' '
  }
  if (data.workExperience) {
    data.workExperience.forEach((exp: any) => {
      if (exp.description) {
        text += exp.description.join(' ') + ' '
      }
    })
  }
  if (data.education) {
    text += JSON.stringify(data.education) + ' '
  }

  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

