import { NextResponse } from 'next/server'
import { renderResumeToHTML } from '@/lib/resume/templateRenderer'
import type { ResumeData } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, templateKey, supportsPhoto } = body

    if (!data) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      )
    }

    // Create a template config
    const templateConfig = {
      id: 'preview',
      name: 'Preview Template',
      supportsPhoto: supportsPhoto || false,
      templateKey: templateKey || null,
    }

    const html = renderResumeToHTML(data as ResumeData, templateConfig)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error: any) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
