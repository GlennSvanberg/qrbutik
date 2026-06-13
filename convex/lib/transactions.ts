import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import type { DbReadCtx } from './auth'

export type Period =
  | 'today'
  | 'yesterday'
  | 'weekend'
  | 'last7'
  | 'last30'
  | 'all'

export const periodArgsValidator = v.union(
  v.literal('today'),
  v.literal('yesterday'),
  v.literal('weekend'),
  v.literal('last7'),
  v.literal('last30'),
  v.literal('all'),
)

const dayMs = 24 * 60 * 60 * 1000

export const getStartOfToday = () => {
  const now = new Date()
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  ).getTime()
}

export const getWeekendRange = (now = new Date()) => {
  const day = now.getDay()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  ).getTime()

  if (day === 6) {
    return { start: startOfToday, end: startOfToday + 2 * dayMs - 1 }
  }

  if (day === 0) {
    return { start: startOfToday - dayMs, end: startOfToday + dayMs - 1 }
  }

  const daysSinceSaturday = (day + 1) % 7
  const lastSaturday = startOfToday - daysSinceSaturday * dayMs
  return {
    start: lastSaturday,
    end: lastSaturday + 2 * dayMs - 1,
  }
}

export const getPeriodRange = (period: Period) => {
  const now = new Date()
  const end = now.getTime()
  const startOfToday = getStartOfToday()

  if (period === 'today') {
    return { start: startOfToday, end }
  }

  if (period === 'yesterday') {
    const start = startOfToday - dayMs
    return { start, end: startOfToday - 1 }
  }

  if (period === 'weekend') {
    return getWeekendRange(now)
  }

  if (period === 'last7') {
    return { start: startOfToday - 6 * dayMs, end }
  }

  if (period === 'last30') {
    return { start: startOfToday - 29 * dayMs, end }
  }

  return { start: 0, end }
}

export const getCustomRange = (start: number, end: number) => {
  if (start > end) {
    throw new Error('Startdatum måste vara före slutdatum.')
  }
  return { start, end }
}

export const getTodayRange = () => getPeriodRange('today')

export type TransactionSummaryInput = {
  _id: Id<'transactions'>
  amount: number
  createdAt: number
  items: Array<{ name: string; price: number; quantity: number }>
}

export const buildSummary = (transactions: Array<TransactionSummaryInput>) => {
  if (transactions.length === 0) {
    return {
      totalRevenue: 0,
      transactionCount: 0,
      averageOrderValue: 0,
      lastSaleTime: null as number | null,
      topItems: [] as Array<{ name: string; quantity: number; revenue: number }>,
      recentSales: [] as Array<{
        _id: Id<'transactions'>
        amount: number
        createdAt: number
        itemsCount: number
      }>,
    }
  }

  const totalRevenue = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  )
  const transactionCount = transactions.length
  const averageOrderValue = totalRevenue / transactionCount
  const lastSaleTime = transactions[0]?.createdAt ?? null

  const itemMap = new Map<string, { quantity: number; revenue: number }>()
  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      const existing = itemMap.get(item.name) ?? {
        quantity: 0,
        revenue: 0,
      }
      existing.quantity += item.quantity
      existing.revenue += item.price * item.quantity
      itemMap.set(item.name, existing)
    })
  })

  const topItems = Array.from(itemMap.entries())
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  const recentSales = transactions.slice(0, 10).map((transaction) => ({
    _id: transaction._id,
    amount: transaction.amount,
    createdAt: transaction.createdAt,
    itemsCount: transaction.items.reduce((sum, item) => sum + item.quantity, 0),
  }))

  return {
    totalRevenue,
    transactionCount,
    averageOrderValue,
    lastSaleTime,
    topItems,
    recentSales,
  }
}

export async function listShopTransactionsInRange(
  ctx: DbReadCtx,
  shopId: Id<'shops'>,
  start: number,
  end: number,
) {
  const transactions = await ctx.db
    .query('transactions')
    .withIndex('by_shopId_and_createdAt', (q) =>
      q.eq('shopId', shopId).gte('createdAt', start).lte('createdAt', end),
    )
    .order('desc')
    .collect()

  return transactions
}

export async function listShopTransactionsAll(
  ctx: DbReadCtx,
  shopId: Id<'shops'>,
) {
  return await ctx.db
    .query('transactions')
    .withIndex('by_shopId', (q) => q.eq('shopId', shopId))
    .order('desc')
    .collect()
}

export async function listTransactionsForShopsInRange(
  ctx: DbReadCtx,
  shopIds: Array<Id<'shops'>>,
  start: number,
  end: number,
  options?: { includePending?: boolean },
) {
  const allTransactions = []

  for (const shopId of shopIds) {
    const transactions = await listShopTransactionsInRange(
      ctx,
      shopId,
      start,
      end,
    )
    for (const transaction of transactions) {
      if (
        options?.includePending !== true &&
        transaction.status !== 'verified'
      ) {
        continue
      }
      allTransactions.push(transaction)
    }
  }

  return allTransactions.sort((a, b) => b.createdAt - a.createdAt)
}
