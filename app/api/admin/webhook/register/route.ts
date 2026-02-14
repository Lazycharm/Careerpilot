import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { registerZiinaWebhook } from '@/lib/ziina'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { webhookUrl, generateSecret } = body

    // Get webhook URL from request or environment
    const url = webhookUrl || process.env.ZIINA_WEBHOOK_URL || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/webhook`

    // Generate secret if requested
    let secret: string | undefined
    if (generateSecret) {
      secret = randomBytes(32).toString('hex')
    } else {
      secret = process.env.ZIINA_WEBHOOK_SECRET
    }

    // Register webhook with Ziina
    const result = await registerZiinaWebhook(url, secret)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to register webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      webhookUrl: url,
      secret: secret ? '***' + secret.slice(-4) : undefined, // Only show last 4 chars
      message: secret && generateSecret 
        ? `Webhook registered! Add this to your .env.local: ZIINA_WEBHOOK_SECRET="${secret}"`
        : 'Webhook registered successfully!',
      fullSecret: generateSecret ? secret : undefined, // Only return full secret if newly generated
    })
  } catch (error: any) {
    console.error('Webhook registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register webhook' },
      { status: 500 }
    )
  }
}

