import { v } from 'convex/values'
import { orgQuery, orgRoleMutation, requireTreasurerMembership } from './lib/customFunctions'
import { getAccessibleShopIds } from './lib/auth'
import { isSubscriptionActive } from './lib/validators'
import {
  buildSummary,
  getCustomRange,
  getPeriodRange,
  getTodayRange,
  getWeekendRange,
  listTransactionsForShopsInRange,
  periodArgsValidator,
} from './lib/transactions'
import type { Id } from './_generated/dataModel'

const dashboardFilterValidator = v.union(
  v.object({
    kind: v.literal('period'),
    period: periodArgsValidator,
  }),
  v.object({
    kind: v.literal('range'),
    start: v.number(),
    end: v.number(),
  }),
)

const shopBreakdownValidator = v.object({
  shopId: v.id('shops'),
  shopName: v.string(),
  teamLabel: v.union(v.string(), v.null()),
  licenseActive: v.boolean(),
  periodRevenue: v.number(),
  todayRevenue: v.number(),
  weekendRevenue: v.number(),
  transactionCount: v.number(),
  latestSaleAt: v.union(v.number(), v.null()),
  latestSaleAmount: v.union(v.number(), v.null()),
})

const editorShopSummaryValidator = v.object({
  shopId: v.id('shops'),
  shopName: v.string(),
  teamLabel: v.union(v.string(), v.null()),
  licenseActive: v.boolean(),
  todayRevenue: v.number(),
  weekendRevenue: v.number(),
  periodRevenue: v.number(),
  latestSaleAt: v.union(v.number(), v.null()),
  latestSaleAmount: v.union(v.number(), v.null()),
})

const dashboardSummaryValidator = v.object({
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
      shopId: v.id('shops'),
      shopName: v.string(),
      amount: v.number(),
      createdAt: v.number(),
      itemsCount: v.number(),
    }),
  ),
  shops: v.array(shopBreakdownValidator),
})

function resolveDateRange(filter: {
  kind: 'period'
  period: Parameters<typeof getPeriodRange>[0]
} | {
  kind: 'range'
  start: number
  end: number
}) {
  if (filter.kind === 'period') {
    return getPeriodRange(filter.period)
  }
  return getCustomRange(filter.start, filter.end)
}

export const getOrganizationDashboardSummary = orgQuery({
  args: {
    organizationId: v.id('organizations'),
    filter: dashboardFilterValidator,
    shopId: v.optional(v.id('shops')),
  },
  returns: dashboardSummaryValidator,
  handler: async (ctx, args) => {
    requireTreasurerMembership(ctx.membership)

    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const accessibleShopIds = await getAccessibleShopIds(
      ctx,
      args.organizationId,
      ctx.membership,
    )

    const shopIds =
      args.shopId !== undefined
        ? accessibleShopIds.filter((id) => id === args.shopId)
        : accessibleShopIds

    if (args.shopId !== undefined && shopIds.length === 0) {
      throw new Error('Unauthorized: no access to this kiosk')
    }

    const { start, end } = resolveDateRange(args.filter)
    const licenseActive = isSubscriptionActive(organization.subscriptionStatus)

    const shops = []
    for (const shopId of accessibleShopIds) {
      const shop = await ctx.db.get('shops', shopId)
      if (shop) {
        shops.push(shop)
      }
    }

    const transactions = await listTransactionsForShopsInRange(
      ctx,
      shopIds,
      start,
      end,
    )

    const todayRange = getTodayRange()
    const weekendRange = getWeekendRange()
    const todayTransactions = await listTransactionsForShopsInRange(
      ctx,
      accessibleShopIds,
      todayRange.start,
      todayRange.end,
    )
    const weekendTransactions = await listTransactionsForShopsInRange(
      ctx,
      accessibleShopIds,
      weekendRange.start,
      weekendRange.end,
    )

    const summary = buildSummary(transactions)

    const shopNameById = new Map(shops.map((shop) => [shop._id, shop.name]))

    const recentSales = transactions.slice(0, 10).map((transaction) => ({
      _id: transaction._id,
      shopId: transaction.shopId,
      shopName: shopNameById.get(transaction.shopId) ?? 'Okänd kiosk',
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      itemsCount: transaction.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
    }))

    const shopBreakdowns = []
    for (const shop of shops) {
      if (!shopIds.includes(shop._id)) {
        continue
      }

      const shopTransactions = transactions.filter(
        (transaction) => transaction.shopId === shop._id,
      )
      const shopSummary = buildSummary(shopTransactions)
      const shopTodayTransactions = todayTransactions.filter(
        (transaction) => transaction.shopId === shop._id,
      )
      const shopWeekendTransactions = weekendTransactions.filter(
        (transaction) => transaction.shopId === shop._id,
      )
      const latestSaleAt =
        shopTransactions.length > 0 ? shopTransactions[0].createdAt : null
      const latestSaleAmount =
        shopTransactions.length > 0 ? shopTransactions[0].amount : null

      shopBreakdowns.push({
        shopId: shop._id,
        shopName: shop.name,
        teamLabel: shop.teamLabel ?? null,
        licenseActive,
        periodRevenue: shopSummary.totalRevenue,
        todayRevenue: buildSummary(shopTodayTransactions).totalRevenue,
        weekendRevenue: buildSummary(shopWeekendTransactions).totalRevenue,
        transactionCount: shopSummary.transactionCount,
        latestSaleAt,
        latestSaleAmount,
      })
    }

    return {
      totalRevenue: summary.totalRevenue,
      transactionCount: summary.transactionCount,
      averageOrderValue: summary.averageOrderValue,
      lastSaleTime: summary.lastSaleTime,
      topItems: summary.topItems,
      recentSales,
      shops: shopBreakdowns,
    }
  },
})

export const getEditorShopSummaries = orgQuery({
  args: { organizationId: v.id('organizations') },
  returns: v.array(editorShopSummaryValidator),
  handler: async (ctx, args) => {
    if (ctx.membership.role !== 'editor') {
      throw new Error('Endast för lagledare')
    }

    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const accessibleShopIds = await getAccessibleShopIds(
      ctx,
      args.organizationId,
      ctx.membership,
    )
    const licenseActive = isSubscriptionActive(organization.subscriptionStatus)

    const todayRange = getTodayRange()
    const weekendRange = getWeekendRange()
    const periodRange = getPeriodRange('last7')

    const todayTransactions = await listTransactionsForShopsInRange(
      ctx,
      accessibleShopIds,
      todayRange.start,
      todayRange.end,
    )
    const weekendTransactions = await listTransactionsForShopsInRange(
      ctx,
      accessibleShopIds,
      weekendRange.start,
      weekendRange.end,
    )
    const periodTransactions = await listTransactionsForShopsInRange(
      ctx,
      accessibleShopIds,
      periodRange.start,
      periodRange.end,
    )

    const summaries = []
    for (const shopId of accessibleShopIds) {
      const shop = await ctx.db.get('shops', shopId)
      if (!shop) {
        continue
      }

      const shopPeriodTransactions = periodTransactions.filter(
        (transaction) => transaction.shopId === shopId,
      )
      const shopTodayTransactions = todayTransactions.filter(
        (transaction) => transaction.shopId === shopId,
      )
      const shopWeekendTransactions = weekendTransactions.filter(
        (transaction) => transaction.shopId === shopId,
      )
      const latestSaleAt =
        shopPeriodTransactions.length > 0
          ? shopPeriodTransactions[0].createdAt
          : null
      const latestSaleAmount =
        shopPeriodTransactions.length > 0
          ? shopPeriodTransactions[0].amount
          : null

      summaries.push({
        shopId: shop._id,
        shopName: shop.name,
        teamLabel: shop.teamLabel ?? null,
        licenseActive,
        todayRevenue: buildSummary(shopTodayTransactions).totalRevenue,
        weekendRevenue: buildSummary(shopWeekendTransactions).totalRevenue,
        periodRevenue: buildSummary(shopPeriodTransactions).totalRevenue,
        latestSaleAt,
        latestSaleAmount,
      })
    }

    return summaries
  },
})

export const updateOrganizationSettings = orgRoleMutation(['owner', 'treasurer'])({
  args: {
    organizationId: v.id('organizations'),
    orgNumber: v.optional(v.string()),
    sieRevenueAccount: v.optional(v.string()),
    logoStorageId: v.optional(v.union(v.id('_storage'), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: {
      orgNumber?: string
      sieRevenueAccount?: string
      logoStorageId?: Id<'_storage'>
    } = {}

    if (args.orgNumber !== undefined) {
      patch.orgNumber = args.orgNumber.trim() || undefined
    }
    if (args.sieRevenueAccount !== undefined) {
      patch.sieRevenueAccount = args.sieRevenueAccount.trim() || undefined
    }
    if (args.logoStorageId !== undefined) {
      if (args.logoStorageId === null) {
        await ctx.db.patch('organizations', args.organizationId, {
          logoStorageId: undefined,
        })
      } else {
        patch.logoStorageId = args.logoStorageId
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch('organizations', args.organizationId, patch)
    }
    return null
  },
})

export const generateLogoUploadUrl = orgRoleMutation(['owner', 'treasurer'])({
  args: { organizationId: v.id('organizations') },
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getOrganizationLogoUrl = orgQuery({
  args: { organizationId: v.id('organizations') },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization?.logoStorageId) {
      return null
    }
    return await ctx.storage.getUrl(organization.logoStorageId)
  },
})
