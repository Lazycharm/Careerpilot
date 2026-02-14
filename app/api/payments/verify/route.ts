import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyZiinaPayment } from '@/lib/ziina'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const type = searchParams.get('type') || 'subscription'
    const subscriptionId = searchParams.get('subscriptionId')

    if (!orderId) {
      return NextResponse.redirect(new URL('/subscription?error=missing_order_id', request.url))
    }

    // Verify payment with Ziina
    const verification = await verifyZiinaPayment(orderId)

    if (!verification.paid) {
      return NextResponse.redirect(new URL('/subscription?error=payment_failed', request.url))
    }

    // Handle subscription activation
    if (type === 'subscription') {
      let subscription
      
      if (subscriptionId) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            ziinaOrderId: orderId,
          },
        })
      } else {
        // Find by order ID or create new
        subscription = await prisma.subscription.findFirst({
          where: { ziinaOrderId: orderId },
        })

        if (subscription) {
          subscription = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          })
        } else {
          // Get user from session
          const session = await getServerSession(authOptions)
          if (session?.user?.id) {
            subscription = await prisma.subscription.create({
              data: {
                userId: session.user.id,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                ziinaOrderId: orderId,
                paymentMethod: 'ziina',
              },
            })
          }
        }
      }
    }

    // Get redirect URL
    const redirectUrl = searchParams.get('redirect') || '/subscription?success=true'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(new URL('/subscription?error=verification_failed', request.url))
  }
}

