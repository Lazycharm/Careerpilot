import { describe, expect, it } from 'vitest'
import { shouldAutoPin } from '@/lib/resume/versions'

describe('shouldAutoPin', () => {
  it('pins on multiples of the default cadence (25)', () => {
    expect(shouldAutoPin(25)).toBe(true)
    expect(shouldAutoPin(50)).toBe(true)
    expect(shouldAutoPin(125)).toBe(true)
  })
  it('does not pin on non-multiples', () => {
    expect(shouldAutoPin(1)).toBe(false)
    expect(shouldAutoPin(24)).toBe(false)
    expect(shouldAutoPin(26)).toBe(false)
  })
  it('respects custom cadence', () => {
    expect(shouldAutoPin(10, 10)).toBe(true)
    expect(shouldAutoPin(9, 10)).toBe(false)
  })
  it('rejects non-positive and non-finite inputs', () => {
    expect(shouldAutoPin(0)).toBe(false)
    expect(shouldAutoPin(-5)).toBe(false)
    expect(shouldAutoPin(NaN)).toBe(false)
  })
})
