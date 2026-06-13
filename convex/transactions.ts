import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { authedMutation, authedQuery } from './lib/customFunctions'
import { requireShopAccess, requireShopIdsAccess } from './lib/auth'
import { isSubscriptionActive } from './lib/validators'
import {
  buildSummary,
  getCustomRange,
  getPeriodRange,
  getTodayRange,
  listShopTransactionsAll,
  listShopTransactionsInRange,
  periodArgsValidator,
} from './lib/transactions'
import type { Id } from './_generated/dataModel'

export const create = mutation({
  args: {
    shopId: v.id('shops'),
    amount: v.number(),
    reference: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
  },
  returns: v.id('transactions'),
  handler: async (ctx, args) => {
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      throw new Error('Butiken hittades inte.')
    }

    const organization = await ctx.db.get('organizations', shop.organizationId)
    if (!organization || !isSubscriptionActive(organization.subscriptionStatus)) {
      throw new Error('Kiosken är inte aktiv just nu.')
    }

    const transactionId = await ctx.db.insert('transactions', {
      shopId: args.shopId,
      amount: args.amount,
      reference: args.reference,
      items: args.items,
      status: 'pending',
      createdAt: Date.now(),
    })
    return transactionId
  },
})

export const get = query({
  args: { transactionId: v.id('transactions') },
  returns: v.union(
    v.object({
      _id: v.id('transactions'),
      _creationTime: v.number(),
      shopId: v.id('shops'),
      amount: v.number(),
      status: v.union(v.literal('pending'), v.literal('verified')),
      reference: v.string(),
      items: v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          quantity: v.number(),
        }),
      ),
      createdAt: v.number(),
      shopName: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get('transactions', args.transactionId)
    if (!transaction) return null

    const shop = await ctx.db.get('shops', transaction.shopId)
    return {
      ...transaction,
      shopName: shop?.name ?? 'Okänd butik',
    }
  },
})

const transactionPayload = v.object({
  _id: v.id('transactions'),
  _creationTime: v.number(),
  shopId: v.id('shops'),
  amount: v.number(),
  status: v.union(v.literal('pending'), v.literal('verified')),
  reference: v.string(),
  items: v.array(
    v.object({
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
    }),
  ),
  createdAt: v.number(),
})

const summaryReturns = v.object({
  totalRevenue: v.number(),
  transactionCount: v.number(),
  averageOrderValue: v.number(),
  lastSaleTime: v.union(v.number(), v.null()),
  topItems: v.array(
    v.object({
      name: v.string(),
      quantity: v.number(),
      revenue: v.number(),
    }),
  ),
  recentSales: v.array(
    v.object({
      _id: v.id('transactions'),
      amount: v.number(),
      createdAt: v.number(),
      itemsCount: v.number(),
    }),
  ),
})

export const getSalesSummaryByShopIds = authedQuery({
  args: { shopIds: v.array(v.id('shops')) },
  returns: v.array(
    v.object({
      shopId: v.id('shops'),
      totalRevenue: v.number(),
      latestSaleAt: v.union(v.number(), v.null()),
      latestSaleAmount: v.union(v.number(), v.null()),
    }),
  ),
  handler: async (ctx, args) => {
    if (args.shopIds.length === 0) {
      return []
    }

    await requireShopIdsAccess(ctx, args.shopIds)

    const summaries = [] as Array<{
      shopId: Id<'shops'>
      totalRevenue: number
      latestSaleAt: number | null
      latestSaleAmount: number | null
    }>

    for (const shopId of args.shopIds) {
      const transactions = await listShopTransactionsAll(ctx, shopId)

      if (transactions.length === 0) {
        summaries.push({
          shopId,
          totalRevenue: 0,
          latestSaleAt: null,
          latestSaleAmount: null,
        })
        continue
      }

      const totalRevenue = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      )
      const latestSale = transactions[0]

      summaries.push({
        shopId,
        totalRevenue,
        latestSaleAt: latestSale.createdAt,
        latestSaleAmount: latestSale.amount,
      })
    }

    return summaries
  },
})

export const listByShop = authedQuery({
  args: { shopId: v.id('shops') },
  returns: v.array(transactionPayload),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId, ['owner', 'treasurer'])
    return await listShopTransactionsAll(ctx, args.shopId)
  },
})

export const listByShopPaginated = authedQuery({
  args: {
    shopId: v.id('shops'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    return await ctx.db
      .query('transactions')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const listTodayByShop = authedQuery({
  args: { shopId: v.id('shops') },
  returns: v.array(transactionPayload),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    const { start, end } = getTodayRange()
    return await listShopTransactionsInRange(ctx, args.shopId, start, end)
  },
})

export const listByShopPeriod = authedQuery({
  args: { shopId: v.id('shops'), period: periodArgsValidator },
  returns: v.array(transactionPayload),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    const { start, end } = getPeriodRange(args.period)
    return await listShopTransactionsInRange(ctx, args.shopId, start, end)
  },
})

export const listByShopDateRange = authedQuery({
  args: {
    shopId: v.id('shops'),
    start: v.number(),
    end: v.number(),
  },
  returns: v.array(transactionPayload),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    const { start, end } = getCustomRange(args.start, args.end)
    return await listShopTransactionsInRange(ctx, args.shopId, start, end)
  },
})

export const verify = authedMutation({
  args: { transactionId: v.id('transactions') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get('transactions', args.transactionId)
    if (!transaction) {
      throw new Error('Transaktionen hittades inte.')
    }
    await requireShopAccess(ctx, transaction.shopId, ['owner', 'treasurer'])
    if (transaction.status !== 'verified') {
      await ctx.db.patch('transactions', args.transactionId, {
        status: 'verified',
      })
    }
    return null
  },
})

export const setVerified = authedMutation({
  args: { transactionId: v.id('transactions'), verified: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get('transactions', args.transactionId)
    if (!transaction) {
      throw new Error('Transaktionen hittades inte.')
    }
    await requireShopAccess(ctx, transaction.shopId, ['owner', 'treasurer'])
    const status = args.verified ? 'verified' : 'pending'
    if (transaction.status !== status) {
      await ctx.db.patch('transactions', args.transactionId, { status })
    }
    return null
  },
})

export const getTodaySummary = authedQuery({
  args: { shopId: v.id('shops') },
  returns: summaryReturns,
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    const { start, end } = getTodayRange()
    const transactions = await listShopTransactionsInRange(
      ctx,
      args.shopId,
      start,
      end,
    )

    return buildSummary(transactions)
  },
})

export const getPeriodSummary = authedQuery({
  args: { shopId: v.id('shops'), period: periodArgsValidator },
  returns: summaryReturns,
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    const { start, end } = getPeriodRange(args.period)
    const transactions = await listShopTransactionsInRange(
      ctx,
      args.shopId,
      start,
      end,
    )

    return buildSummary(transactions)
  },
})

export const getDateRangeSummary = authedQuery({
  args: {
    shopId: v.id('shops'),
    start: v.number(),
    end: v.number(),
  },
  returns: summaryReturns,
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    const { start, end } = getCustomRange(args.start, args.end)
    const transactions = await listShopTransactionsInRange(
      ctx,
      args.shopId,
      start,
      end,
    )

    return buildSummary(transactions)
  },
})
