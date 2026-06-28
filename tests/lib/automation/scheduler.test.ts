import { describe, expect, it } from 'vitest'
import {
  computeNextRunAt,
  isWithinWorkingHours,
  withDefaults,
} from '@/lib/automation/scheduler'

describe('withDefaults', () => {
  it('applies UAE-friendly defaults when no config provided', () => {
    const c = withDefaults(null)
    expect(c.timezone).toBe('Asia/Dubai')
    expect(c.cadenceMinutes).toBe(30)
    expect(c.startHour).toBe(9)
    expect(c.endHour).toBe(18)
    expect(c.dailyCap).toBe(10)
  })
  it('lets caller override individual fields', () => {
    const c = withDefaults({ cadenceMinutes: 60, dailyCap: 5 })
    expect(c.cadenceMinutes).toBe(60)
    expect(c.dailyCap).toBe(5)
    expect(c.timezone).toBe('Asia/Dubai')
  })
})

describe('isWithinWorkingHours', () => {
  it('returns true at midday Dubai time', () => {
    // 2026-06-23 09:00 UTC = 13:00 Asia/Dubai (UTC+4)
    const noonDubai = new Date('2026-06-23T09:00:00.000Z')
    expect(isWithinWorkingHours(noonDubai, null)).toBe(true)
  })
  it('returns false in the early hours Dubai time', () => {
    // 2026-06-23 22:00 UTC = 02:00 Asia/Dubai next day
    const earlyDubai = new Date('2026-06-23T22:00:00.000Z')
    expect(isWithinWorkingHours(earlyDubai, null)).toBe(false)
  })
})

describe('computeNextRunAt', () => {
  it('advances by cadence when inside the working window', () => {
    const start = new Date('2026-06-23T09:00:00.000Z') // 13:00 Dubai
    const next = computeNextRunAt(start, { cadenceMinutes: 45 })
    const deltaMs = next.getTime() - start.getTime()
    // Should be ~45 minutes (might roll into window if outside).
    expect(deltaMs).toBeGreaterThanOrEqual(45 * 60_000)
  })
  it('rolls into the next working window when off-hours', () => {
    // Midnight Dubai = 20:00 UTC previous day.
    const offHours = new Date('2026-06-22T20:00:00.000Z')
    const next = computeNextRunAt(offHours, null)
    expect(next.getTime()).toBeGreaterThan(offHours.getTime())
    // It should land within 9-18 Dubai → 05-14 UTC.
    const hUtc = next.getUTCHours()
    expect(hUtc).toBeGreaterThanOrEqual(5)
    expect(hUtc).toBeLessThan(14)
  })
})
