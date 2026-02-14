// Ziina Payment Gateway Integration
// Documentation: https://docs.ziina.com/api-reference/payment-intent/create

import { v4 as uuidv4 } from 'uuid'

interface ZiinaPaymentRequest {
  amount: number // Amount in fils (e.g., 10000 for 100 AED)
  currency: string // 3-letter ISO-4217 code (e.g., 'AED')
  description?: string // Message to display on payment page
  customerEmail?: string
  customerName?: string
  returnUrl: string // success_url
  cancelUrl: string // cancel_url
  failureUrl?: string // failure_url
  test?: boolean // Whether to create a test payment
  metadata?: Record<string, any>
}

interface ZiinaPaymentResponse {
  orderId: string
  paymentUrl: string
  status: string
}

export async function createZiinaPayment(
  request: ZiinaPaymentRequest
): Promise<ZiinaPaymentResponse> {
  const apiKey = process.env.ZIINA_API_KEY

  if (!apiKey) {
    throw new Error('Ziina API key not configured')
  }

  // Generate unique operation ID for idempotency
  const operationId = uuidv4()

  const response = await fetch('https://api-v2.ziina.com/api/payment_intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      amount: request.amount, // Amount in fils
      currency_code: request.currency || 'AED',
      message: request.description,
      success_url: request.returnUrl,
      cancel_url: request.cancelUrl,
      failure_url: request.failureUrl,
      test: request.test || false,
      operation_id: operationId,
      metadata: request.metadata,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Ziina API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  return {
    orderId: data.id,
    paymentUrl: data.redirect_url,
    status: data.status,
  }
}

export async function verifyZiinaPayment(orderId: string): Promise<{
  status: string
  paid: boolean
  amount?: number
}> {
  const apiKey = process.env.ZIINA_API_KEY

  if (!apiKey) {
    throw new Error('Ziina API key not configured')
  }

  // Fetch payment intent details
  const response = await fetch(`https://api-v2.ziina.com/api/payment_intent/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Ziina API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  return {
    status: data.status,
    paid: data.status === 'completed',
    amount: data.amount,
  }
}

export function verifyZiinaWebhook(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.ZIINA_WEBHOOK_SECRET
  if (!webhookSecret) {
    return false
  }

  // Ziina uses HMAC SHA256 for webhook signature verification
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Register webhook with Ziina
export async function registerZiinaWebhook(
  webhookUrl: string,
  secret?: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.ZIINA_API_KEY

  if (!apiKey) {
    throw new Error('Ziina API key not configured')
  }

  try {
    const response = await fetch('https://api-v2.ziina.com/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: webhookUrl,
        ...(secret && { secret }),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `Failed to register webhook: ${response.statusText} - ${JSON.stringify(errorData)}`,
      }
    }

    const data = await response.json()
    return {
      success: data.success !== false,
      error: data.error,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to register webhook',
    }
  }
}
