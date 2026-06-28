import { describe, expect, it } from 'vitest'
import {
  paymentApprovedEmail,
  paymentRejectedEmail,
} from '@/lib/email/templates'

describe('paymentApprovedEmail', () => {
  it('produces subject + html + text and includes the plan name + amount', () => {
    const out = paymentApprovedEmail({
      userName: 'Yasmin',
      planName: 'Premium Bundle',
      amountAED: '5.00',
      periodEndIso: null,
    })
    expect(out.subject).toMatch(/Premium Bundle/)
    expect(out.html).toContain('Premium Bundle')
    expect(out.html).toContain('5.00 AED')
    expect(out.text).toContain('Yasmin')
    expect(out.text).toContain('Premium Bundle')
  })

  it('formats the period-end date when supplied', () => {
    const out = paymentApprovedEmail({
      userName: 'Y',
      planName: 'Monthly Plan',
      amountAED: '75.00',
      periodEndIso: '2027-01-15T00:00:00.000Z',
    })
    expect(out.html).toMatch(/15 Jan 2027|Jan 15 2027/)
  })

  it('escapes HTML in user-controlled fields', () => {
    const out = paymentApprovedEmail({
      userName: '<script>alert(1)</script>',
      planName: 'Plan',
      amountAED: '5.00',
      periodEndIso: null,
    })
    expect(out.html).not.toContain('<script>alert(1)</script>')
    expect(out.html).toContain('&lt;script&gt;')
  })
})

describe('paymentRejectedEmail', () => {
  it('includes the rejection reason', () => {
    const out = paymentRejectedEmail({
      userName: 'Y',
      planName: 'Premium Bundle',
      reason: 'No proof of payment received',
    })
    expect(out.subject).toMatch(/couldn['’]t confirm/i)
    expect(out.html).toContain('No proof of payment received')
    expect(out.text).toContain('No proof of payment received')
  })
})
