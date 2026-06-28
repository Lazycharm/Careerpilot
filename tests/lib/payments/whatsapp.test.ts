import { describe, expect, it } from 'vitest'
import {
  buildWhatsAppUrl,
  filsToAED,
  renderTemplate,
} from '@/lib/payments/whatsapp'

describe('renderTemplate', () => {
  it('substitutes simple merge tags', () => {
    const out = renderTemplate('Hi {{userName}}, pay {{amountAED}} AED.', {
      userName: 'Yasmin',
      amountAED: '5.00',
    })
    expect(out).toBe('Hi Yasmin, pay 5.00 AED.')
  })

  it('tolerates whitespace inside tags', () => {
    expect(renderTemplate('Ref {{  paymentId  }}', { paymentId: 'abc' })).toBe('Ref abc')
  })

  it('renders missing tags as empty string (not "undefined")', () => {
    expect(renderTemplate('Plan: {{planName}}', {})).toBe('Plan: ')
  })
})

describe('buildWhatsAppUrl', () => {
  it('strips non-digits and URL-encodes the message', () => {
    const url = buildWhatsAppUrl('+971 50 123 4567', 'Hi & welcome')
    expect(url.startsWith('https://wa.me/971501234567?text=')).toBe(true)
    expect(url).toContain(encodeURIComponent('Hi & welcome'))
  })

  it('throws when no digits are present', () => {
    expect(() => buildWhatsAppUrl('abc', 'hi')).toThrow(/digits/)
  })
})

describe('filsToAED', () => {
  it('formats fils as AED with 2 decimals', () => {
    expect(filsToAED(500)).toBe('5.00')
    expect(filsToAED(2599)).toBe('25.99')
    expect(filsToAED(0)).toBe('0.00')
  })
})
