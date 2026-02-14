import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createZiinaPayment } from '@/lib/ziina'
import { getSettingAsBoolean, getSettingAsNumber } from '@/lib/settings'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if subscription is enabled
    const subscriptionEnabled = await getSettingAsBoolean('subscription_enabled')
    if (!subscriptionEnabled) {
      return NextResponse.json(
        { error: 'Subscriptions are currently disabled' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, amount } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    // Get amount from settings if not provided
    let paymentAmount = amount
    if (type === 'subscription') {
      // Get subscription price from settings
      paymentAmount = paymentAmount || (await getSettingAsNumber('subscription_price')) || 100
    } else if (type === 'resume') {
      paymentAmount = paymentAmount || (await getSettingAsNumber('resume_download_price')) || 50
    } else if (type === 'cover_letter') {
      paymentAmount = paymentAmount || (await getSettingAsNumber('cover_letter_price')) || 30
    }
    
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Convert AED to fils (Ziina uses fils: 1 AED = 100 fils)
    const amountInFils = Math.round(paymentAmount * 100)

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUrl = new URL('/subscription', baseUrl)
    redirectUrl.searchParams.set('redirect', body.redirect || '/dashboard')

    // Create subscription record first (pending status)
    let subscriptionId: string | null = null
    if (type === 'subscription') {
      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          status: 'active', // Will be confirmed after payment
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          paymentMethod: 'ziina',
        },
      })
      subscriptionId = subscription.id
    }

    // Create payment with Ziina
    const payment = await createZiinaPayment({
      amount: amountInFils,
      currency: 'AED',
      description: type === 'subscription' ? 'Premium Subscription' : `${type === 'resume' ? 'Resume' : 'Cover Letter'} Download`,
      customerEmail: session.user.email || '',
      customerName: session.user.name || '',
      returnUrl: `${baseUrl}/api/payments/verify?orderId={orderId}&type=${type}&subscriptionId=${subscriptionId || ''}`,
      cancelUrl: `${baseUrl}/subscription?cancelled=true`,
      metadata: {
        userId: session.user.id,
        type,
        subscriptionId: subscriptionId || '',
      },
    })

    // Update subscription with order ID if created
    if (subscriptionId) {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { ziinaOrderId: payment.orderId },
      })
    }

    return NextResponse.json({
      orderId: payment.orderId,
      paymentUrl: payment.paymentUrl,
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}

