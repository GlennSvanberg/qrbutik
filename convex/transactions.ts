import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

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
  handler: async (ctx, args) => {
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

const getTodayRange = () => {
  const now = new Date()
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  ).getTime()
  return { start, end: now.getTime() }
}

export const listByShop = query({
  args: { shopId: v.id('shops') },
  returns: v.array(transactionPayload),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('transactions')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .order('desc')
      .collect()
  },
})

export const listByShopPaginated = query({
  args: {
    shopId: v.id('shops'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('transactions')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const listTodayByShop = query({
  args: { shopId: v.id('shops') },
  returns: v.array(transactionPayload),
  handler: async (ctx, args) => {
    const { start, end } = getTodayRange()
    return await ctx.db
      .query('transactions')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .filter((q) => q.gte(q.field('createdAt'), start))
      .filter((q) => q.lte(q.field('createdAt'), end))
      .order('desc')
      .collect()
  },
})

export const verify = mutation({
  args: { transactionId: v.id('transactions') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get('transactions', args.transactionId)
    if (!transaction) {
      throw new Error('Transaktionen hittades inte.')
    }
    if (transaction.status !== 'verified') {
      await ctx.db.patch('transactions', args.transactionId, {
        status: 'verified',
      })
    }
    return null
  },
})

export const setVerified = mutation({
  args: { transactionId: v.id('transactions'), verified: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get('transactions', args.transactionId)
    if (!transaction) {
      throw new Error('Transaktionen hittades inte.')
    }
    const status = args.verified ? 'verified' : 'pending'
    if (transaction.status !== status) {
      await ctx.db.patch('transactions', args.transactionId, { status })
    }
    return null
  },
})

export const getTodaySummary = query({
  args: { shopId: v.id('shops') },
  returns: v.object({
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
  }),
  handler: async (ctx, args) => {
    const { start, end } = getTodayRange()
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .filter((q) => q.gte(q.field('createdAt'), start))
      .filter((q) => q.lte(q.field('createdAt'), end))
      .order('desc')
      .collect()

    if (transactions.length === 0) {
      return {
        totalRevenue: 0,
        transactionCount: 0,
        averageOrderValue: 0,
        lastSaleTime: null,
        topItems: [],
        recentSales: [],
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

    const recentSales = transactions.slice(0, 5).map((transaction) => ({
      _id: transaction._id,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      itemsCount: transaction.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
    }))

    return {
      totalRevenue,
      transactionCount,
      averageOrderValue,
      lastSaleTime,
      topItems,
      recentSales,
    }
  },
})
