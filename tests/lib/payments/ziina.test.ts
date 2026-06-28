import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  ZIINA_WEBHOOK_IPS,
  isZiinaWebhookIP,
  verifyZiinaSignature,
} from '@/lib/payments/ziina'

describe('isZiinaWebhookIP', () => {
  it('accepts every documented IP', () => {
    for (const ip of ZIINA_WEBHOOK_IPS) {
      expect(isZiinaWebhookIP(ip)).toBe(true)
    }
  })
  it('rejects null, empty, and spoof attempts', () => {
    expect(isZiinaWebhookIP(null)).toBe(false)
    expect(isZiinaWebhookIP('')).toBe(false)
    expect(isZiinaWebhookIP('1.2.3.4')).toBe(false)
    expect(isZiinaWebhookIP(' 3.29.184.186 ')).toBe(true) // trimmed
  })
})

describe('verifyZiinaSignature', () => {
  const SECRET = 'super-secret'
  const body = JSON.stringify({
    event: 'payment_intent.status.updated',
    data: { id: 'pi_123', status: 'completed' },
  })
  const validSig = createHmac('sha256', SECRET).update(body).digest('hex')

  it('accepts a valid signature', () => {
    expect(
      verifyZiinaSignature({ rawBody: body, signatureHeader: validSig, secret: SECRET })
    ).toBe(true)
  })

  it('rejects a tampered body with the same signature', () => {
    const tampered = body.replace('completed', 'failed')
    expect(
      verifyZiinaSignature({ rawBody: tampered, signatureHeader: validSig, secret: SECRET })
    ).toBe(false)
  })

  it('rejects a wrong signature length', () => {
    expect(
      verifyZiinaSignature({ rawBody: body, signatureHeader: 'abc', secret: SECRET })
    ).toBe(false)
  })

  it('rejects missing header', () => {
    expect(
      verifyZiinaSignature({ rawBody: body, signatureHeader: null, secret: SECRET })
    ).toBe(false)
  })

  it('rejects when no secret is configured', () => {
    expect(
      verifyZiinaSignature({ rawBody: body, signatureHeader: validSig, secret: '' })
    ).toBe(false)
  })
})
