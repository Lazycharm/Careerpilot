import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiGenerate } from '@/lib/ai/router'
import { checkAILimit, incrementAIUsage, AI_LIMIT_EXCEEDED_MESSAGE } from '@/lib/aiUsage'

export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await checkAILimit(session.user.id, 'cover_letter')

    const body = await request.json()
    const { action } = body

    if (!action || !['improve', 'shorten', 'elongate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: improve, shorten, or elongate' },
        { status: 400 }
      )
    }

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
    }

    const instructions: Record<string, string> = {
      improve: 'Improve the quality, professionalism, and impact of this cover letter. Make it more compelling while keeping the same length and format.',
      shorten: 'Shorten this cover letter to about 250-300 words. Keep the most impactful content and the exact UAE format (header, recipient, body, closing).',
      elongate: 'Expand this cover letter to about 450-500 words. Add more specific details, achievements, and enthusiasm while maintaining professional UAE format.',
    }

    const result = await aiGenerate({
      useCase: 'tailor_cl',
      systemPrompt: 'You are a professional cover letter writer for the UAE job market. Maintain the exact format, all contact info, and professional tone.',
      prompt: `${instructions[action]}

CURRENT COVER LETTER:
${coverLetter.content}

Job Title: ${coverLetter.jobTitle}
Industry: ${coverLetter.industry}

REQUIREMENTS:
- Keep ALL contact information exactly as shown
- Maintain UAE cover letter format (header, recipient, body, closing)
- No placeholders — use real values from the original
- Return ONLY the cover letter text, no explanations

Generate the ${action}d cover letter:`,
      temperature: 0.7,
      maxTokens: 1200,
    })

    await incrementAIUsage(session.user.id, 'cover_letter')

    const updated = await prisma.coverLetter.update({
      where: { id: params.id },
      data: { content: result.text.trim() },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[cover-letter.customize]', error)
    if (error.message === AI_LIMIT_EXCEEDED_MESSAGE) {
      return NextResponse.json({ error: AI_LIMIT_EXCEEDED_MESSAGE }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to customize cover letter' },
      { status: 500 }
    )
  }
}
