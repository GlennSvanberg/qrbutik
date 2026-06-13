import { describe, expect, it } from 'vitest'
import { daysUntil } from './billing'

describe('daysUntil', () => {
  const now = Date.UTC(2025, 5, 13, 12, 0, 0)

  it('returns null without a timestamp', () => {
    expect(daysUntil(undefined, now)).toBeNull()
  })

  it('returns 0 when timestamp is in the past', () => {
    expect(daysUntil(now - 60_000, now)).toBe(0)
  })

  it('ceilings partial days', () => {
    const twoAndHalfDays = now + 2.5 * 24 * 60 * 60 * 1000
    expect(daysUntil(twoAndHalfDays, now)).toBe(3)
  })
})
