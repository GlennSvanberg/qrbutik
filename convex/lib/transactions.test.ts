import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildSummary,
  getCustomRange,
  getPeriodRange,
  getWeekendRange,
  listTransactionsForShopsInRange,
} from './transactions'
import type { Doc, Id } from '../_generated/dataModel'
import type { DbReadCtx } from './auth'

const dayMs = 24 * 60 * 60 * 1000

function tx(
  id: string,
  shopId: string,
  createdAt: number,
  amount: number,
  status: 'pending' | 'verified' = 'verified',
): Doc<'transactions'> {
  return {
    _id: id as Id<'transactions'>,
    _creationTime: createdAt,
    shopId: shopId as Id<'shops'>,
    amount,
    status,
    reference: `REF-${id}`,
    items: [{ name: 'Korv', price: amount / 2, quantity: 2 }],
    createdAt,
  }
}

function createMockReadCtx(
  allTransactions: Array<Doc<'transactions'>>,
): DbReadCtx {
  return {
    db: {
      query: (table: string) => {
        if (table !== 'transactions') {
          throw new Error(`Unexpected table: ${table}`)
        }
        return {
          withIndex: (
            _index: string,
            builder: (q: {
              eq: (
                field: string,
                value: unknown,
              ) => {
                gte: (
                  field: string,
                  start: number,
                ) => {
                  lte: (field: string, end: number) => unknown
                }
              }
            }) => unknown,
          ) => {
            const filters: {
              shopId?: Id<'shops'>
              start?: number
              end?: number
            } = {}
            const q = {
              eq: (field: string, value: unknown) => {
                if (field === 'shopId') {
                  filters.shopId = value as Id<'shops'>
                }
                return {
                  gte: (_field: string, start: number) => {
                    filters.start = start
                    return {
                      lte: (_field2: string, end: number) => {
                        filters.end = end
                        return {}
                      },
                    }
                  },
                }
              },
            }
            builder(q)
            const filtered = allTransactions
              .filter((transaction) => transaction.shopId === filters.shopId)
              .filter(
                (transaction) =>
                  transaction.createdAt >= (filters.start ?? 0),
              )
              .filter(
                (transaction) =>
                  transaction.createdAt <= (filters.end ?? Number.MAX_SAFE_INTEGER),
              )
              .sort((a, b) => b.createdAt - a.createdAt)

            return {
              order: (_direction: string) => ({
                collect: async () => filtered,
              }),
            }
          },
        }
      },
    },
  } as unknown as DbReadCtx
}

describe('buildSummary', () => {
  it('returns zeros and empty arrays for no transactions', () => {
    const summary = buildSummary([])
    expect(summary).toEqual({
      totalRevenue: 0,
      transactionCount: 0,
      averageOrderValue: 0,
      lastSaleTime: null,
      topItems: [],
      recentSales: [],
    })
  })

  it('aggregates revenue, counts, top items, and recent sales', () => {
    const summary = buildSummary([
      {
        _id: 'tx_1' as Id<'transactions'>,
        amount: 120,
        createdAt: 2000,
        items: [
          { name: 'Korv', price: 60, quantity: 2 },
          { name: 'Läsk', price: 20, quantity: 1 },
        ],
      },
      {
        _id: 'tx_2' as Id<'transactions'>,
        amount: 60,
        createdAt: 1000,
        items: [{ name: 'Korv', price: 60, quantity: 1 }],
      },
    ])

    expect(summary.totalRevenue).toBe(180)
    expect(summary.transactionCount).toBe(2)
    expect(summary.averageOrderValue).toBe(90)
    expect(summary.lastSaleTime).toBe(2000)
    expect(summary.topItems[0]).toEqual({
      name: 'Korv',
      quantity: 3,
      revenue: 180,
    })
    expect(summary.recentSales).toHaveLength(2)
    expect(summary.recentSales[0]).toMatchObject({
      _id: 'tx_1',
      amount: 120,
      itemsCount: 3,
    })
  })
})

describe('getWeekendRange', () => {
  it('on Saturday spans through Sunday end', () => {
    const saturday = new Date(2025, 5, 14, 15, 0, 0)
    const startOfToday = new Date(
      saturday.getFullYear(),
      saturday.getMonth(),
      saturday.getDate(),
      0,
      0,
      0,
      0,
    ).getTime()

    expect(getWeekendRange(saturday)).toEqual({
      start: startOfToday,
      end: startOfToday + 2 * dayMs - 1,
    })
  })

  it('on Sunday spans Saturday through Sunday end', () => {
    const sunday = new Date(2025, 5, 15, 10, 0, 0)
    const startOfToday = new Date(
      sunday.getFullYear(),
      sunday.getMonth(),
      sunday.getDate(),
      0,
      0,
      0,
      0,
    ).getTime()

    expect(getWeekendRange(sunday)).toEqual({
      start: startOfToday - dayMs,
      end: startOfToday + dayMs - 1,
    })
  })

  it('on weekday spans previous Saturday through Sunday', () => {
    const wednesday = new Date(2025, 5, 11, 12, 0, 0)
    const startOfToday = new Date(
      wednesday.getFullYear(),
      wednesday.getMonth(),
      wednesday.getDate(),
      0,
      0,
      0,
      0,
    ).getTime()
    const lastSaturday = startOfToday - 4 * dayMs

    expect(getWeekendRange(wednesday)).toEqual({
      start: lastSaturday,
      end: lastSaturday + 2 * dayMs - 1,
    })
  })
})

describe('getPeriodRange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 14, 15, 30, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns today range from midnight to now', () => {
    const now = Date.now()
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getPeriodRange('today')).toEqual({ start: startOfToday, end: now })
  })

  it('returns yesterday as full prior calendar day', () => {
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getPeriodRange('yesterday')).toEqual({
      start: startOfToday - dayMs,
      end: startOfToday - 1,
    })
  })

  it('returns weekend range on Saturday', () => {
    expect(getPeriodRange('weekend')).toEqual(getWeekendRange(new Date()))
  })

  it('returns last7 from six days before today through now', () => {
    const now = Date.now()
    const startOfToday = new Date(2025, 5, 14, 0, 0, 0, 0).getTime()
    expect(getPeriodRange('last7')).toEqual({
      start: startOfToday - 6 * dayMs,
      end: now,
    })
  })

  it('returns all-time range', () => {
    expect(getPeriodRange('all')).toEqual({ start: 0, end: Date.now() })
  })
})

describe('getCustomRange', () => {
  it('returns the provided start and end when valid', () => {
    expect(getCustomRange(100, 200)).toEqual({ start: 100, end: 200 })
  })

  it('throws when start is after end', () => {
    expect(() => getCustomRange(200, 100)).toThrow(
      'Startdatum måste vara före slutdatum.',
    )
  })
})

describe('listTransactionsForShopsInRange', () => {
  const shopA = 'shop_a' as Id<'shops'>
  const shopB = 'shop_b' as Id<'shops'>

  it('excludes pending transactions by default', async () => {
    const ctx = createMockReadCtx([
      tx('tx_v', shopA, 1000, 120, 'verified'),
      tx('tx_p', shopA, 900, 60, 'pending'),
    ])

    const result = await listTransactionsForShopsInRange(
      ctx,
      [shopA],
      0,
      2000,
    )

    expect(result).toHaveLength(1)
    expect(result[0]?._id).toBe('tx_v')
  })

  it('includes pending when includePending is true', async () => {
    const ctx = createMockReadCtx([
      tx('tx_v', shopA, 1000, 120, 'verified'),
      tx('tx_p', shopA, 900, 60, 'pending'),
    ])

    const result = await listTransactionsForShopsInRange(
      ctx,
      [shopA],
      0,
      2000,
      { includePending: true },
    )

    expect(result).toHaveLength(2)
  })

  it('merges and sorts transactions across shops', async () => {
    const ctx = createMockReadCtx([
      tx('tx_a', shopA, 1000, 120, 'verified'),
      tx('tx_b', shopB, 1500, 60, 'verified'),
      tx('tx_pending', shopB, 1400, 30, 'pending'),
    ])

    const result = await listTransactionsForShopsInRange(
      ctx,
      [shopA, shopB],
      0,
      2000,
    )

    expect(result.map((row) => row._id)).toEqual(['tx_b', 'tx_a'])
  })
})
