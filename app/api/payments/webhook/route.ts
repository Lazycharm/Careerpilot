import { NextResponse } from 'next/server'
import { verifyZiinaWebhook } from '@/lib/ziina'
import { prisma } from '@/lib/prisma'

// Allowed Ziina webhook IPs for security
const ALLOWED_IPS = ['3.29.184.186', '3.29.190.95', '20.233.47.127']

export async function POST(request: Request) {
  try {
    // Get client IP (optional security check)
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIp = forwarded ? forwarded.split(',')[0] : null
    
    // Get HMAC signature from header
    const signature = request.headers.get('x-hmac-signature')
    const body = await request.text()

    // Verify webhook signature if secret is configured
    if (signature && process.env.ZIINA_WEBHOOK_SECRET) {
      const isValid = verifyZiinaWebhook(body, signature)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const payload = JSON.parse(body)
    const { event, data } = payload

    console.log('Webhook received:', { event, paymentIntentId: data.id })

    // Handle payment_intent.status.updated event
    if (event === 'payment_intent.status.updated') {
      const paymentIntentId = data.id
      const status = data.status

      // Only process completed payments
      if (status === 'completed') {
        // Find subscription by payment intent ID
        const subscription = await prisma.subscription.findFirst({
          where: { ziinaOrderId: paymentIntentId },
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            },
          })
          console.log('Subscription activated:', subscription.id)
        } else {
          console.warn('No subscription found for payment intent:', paymentIntentId)
        }
      } else if (status === 'failed') {
        // Handle failed payment
        const subscription = await prisma.subscription.findFirst({
          where: { ziinaOrderId: paymentIntentId },
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'cancelled' },
          })
          console.log('Subscription cancelled due to failed payment:', subscription.id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

