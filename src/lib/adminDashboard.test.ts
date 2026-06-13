import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDateRangeForPeriod } from './adminDashboard'

const dayMs = 24 * 60 * 60 * 1000

describe('getDateRangeForPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 14, 15, 30, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns today from midnight through now', () => {
    const now = Date.now()
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getDateRangeForPeriod('today')).toEqual({
      start: startOfToday,
      end: now,
    })
  })

  it('returns yesterday as the prior calendar day', () => {
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getDateRangeForPeriod('yesterday')).toEqual({
      start: startOfToday - dayMs,
      end: startOfToday - 1,
    })
  })

  it('returns weekend range on Saturday', () => {
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getDateRangeForPeriod('weekend')).toEqual({
      start: startOfToday,
      end: startOfToday + 2 * dayMs - 1,
    })
  })

  it('returns last7 from six days before today through now', () => {
    const now = Date.now()
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getDateRangeForPeriod('last7')).toEqual({
      start: startOfToday - 6 * dayMs,
      end: now,
    })
  })

  it('parses custom date strings as local day boundaries', () => {
    expect(
      getDateRangeForPeriod('custom', '2025-06-10', '2025-06-12'),
    ).toEqual({
      start: new Date('2025-06-10T00:00:00').getTime(),
      end: new Date('2025-06-12T23:59:59.999').getTime(),
    })
  })

  it('falls back to today when custom dates are missing', () => {
    const now = Date.now()
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getDateRangeForPeriod('custom')).toEqual({
      start: startOfToday,
      end: now,
    })
  })
})
