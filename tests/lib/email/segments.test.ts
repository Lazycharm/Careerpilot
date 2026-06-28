import { describe, expect, it } from 'vitest'
import { compileSegmentWhere } from '@/lib/email/segments'

describe('compileSegmentWhere', () => {
  it('returns an empty where for allUsers', () => {
    expect(compileSegmentWhere({ allUsers: true })).toEqual({})
  })

  it('compiles role filter', () => {
    expect(compileSegmentWhere({ roles: ['admin'] })).toEqual({
      role: { in: ['admin'] },
    })
  })

  it('compiles created-since and before into a single createdAt range', () => {
    const w = compileSegmentWhere({
      createdSince: '2026-01-01T00:00:00.000Z',
      createdBefore: '2026-06-01T00:00:00.000Z',
    })
    expect(w.createdAt).toEqual({
      gte: new Date('2026-01-01T00:00:00.000Z'),
      lt: new Date('2026-06-01T00:00:00.000Z'),
    })
  })

  it('compiles hasActiveSubscription true → some-of', () => {
    const w = compileSegmentWhere({ hasActiveSubscription: true })
    expect(w.subscriptions).toEqual({ some: { status: 'active' } })
  })

  it('compiles hasActiveSubscription false → none-of', () => {
    const w = compileSegmentWhere({ hasActiveSubscription: false })
    expect(w.subscriptions).toEqual({ none: { status: 'active' } })
  })

  it('compiles pricingCodes into active subscription with pricing.code in', () => {
    const w = compileSegmentWhere({ pricingCodes: ['monthly', 'weekly'] })
    expect(w.subscriptions).toEqual({
      some: {
        status: 'active',
        pricing: { code: { in: ['monthly', 'weekly'] } },
      },
    })
  })
})
