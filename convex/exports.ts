import { v } from 'convex/values'
import { internalQuery } from './_generated/server'
import { orgQuery, requireTreasurerMembership } from './lib/customFunctions'
import { getAccessibleShopIds } from './lib/auth'
import { buildItemsSummary } from './lib/exportFormat'
import {
  getCustomRange,
  listTransactionsForShopsInRange,
} from './lib/transactions'
import type { ExportRow } from './lib/exportFormat'

const exportRowValidator = v.object({
  createdAt: v.number(),
  shopName: v.string(),
  shopSlug: v.string(),
  amount: v.number(),
  reference: v.string(),
  status: v.union(v.literal('pending'), v.literal('verified')),
  itemsSummary: v.string(),
  itemCount: v.number(),
})

export const listTransactionsForExport = orgQuery({
  args: {
    organizationId: v.id('organizations'),
    shopId: v.optional(v.id('shops')),
    start: v.number(),
    end: v.number(),
    includePending: v.optional(v.boolean()),
  },
  returns: v.array(exportRowValidator),
  handler: async (ctx, args) => {
    requireTreasurerMembership(ctx.membership)

    const { start, end } = getCustomRange(args.start, args.end)
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

    const transactions = await listTransactionsForShopsInRange(
      ctx,
      shopIds,
      start,
      end,
      { includePending: args.includePending ?? false },
    )

    const rows: Array<ExportRow> = []

    for (const transaction of transactions) {
      const shop = await ctx.db.get('shops', transaction.shopId)
      if (!shop) {
        continue
      }

      rows.push({
        createdAt: transaction.createdAt,
        shopName: shop.name,
        shopSlug: shop.slug,
        amount: transaction.amount,
        reference: transaction.reference,
        status: transaction.status,
        itemsSummary: buildItemsSummary(transaction.items),
        itemCount: transaction.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      })
    }

    return rows
  },
})

export const listTransactionsForExportInternal = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    callerEmail: v.string(),
    shopId: v.optional(v.id('shops')),
    start: v.number(),
    end: v.number(),
    includePending: v.optional(v.boolean()),
  },
  returns: v.object({
    rows: v.array(exportRowValidator),
    organizationName: v.string(),
    orgNumber: v.optional(v.string()),
    sieRevenueAccount: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organizationId_and_email', (q) =>
        q.eq('organizationId', args.organizationId).eq('email', args.callerEmail),
      )
      .unique()

    if (!membership || !['owner', 'treasurer'].includes(membership.role)) {
      throw new Error('Unauthorized: treasurer access required')
    }

    const accessibleShopIds = membership.role === 'owner' || membership.role === 'treasurer'
      ? (
          await ctx.db
            .query('shops')
            .withIndex('by_organizationId', (q) =>
              q.eq('organizationId', args.organizationId),
            )
            .collect()
        ).map((shop) => shop._id)
      : (membership.assignedShopIds ?? [])

    const shopIds =
      args.shopId !== undefined
        ? accessibleShopIds.filter((id) => id === args.shopId)
        : accessibleShopIds

    const { start, end } = getCustomRange(args.start, args.end)
    const transactions = await listTransactionsForShopsInRange(
      ctx,
      shopIds,
      start,
      end,
      { includePending: args.includePending ?? false },
    )

    const rows: Array<ExportRow> = []
    for (const transaction of transactions) {
      const shop = await ctx.db.get('shops', transaction.shopId)
      if (!shop) {
        continue
      }
      rows.push({
        createdAt: transaction.createdAt,
        shopName: shop.name,
        shopSlug: shop.slug,
        amount: transaction.amount,
        reference: transaction.reference,
        status: transaction.status,
        itemsSummary: buildItemsSummary(transaction.items),
        itemCount: transaction.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      })
    }

    return {
      rows,
      organizationName: organization.name,
      orgNumber: organization.orgNumber,
      sieRevenueAccount: organization.sieRevenueAccount,
    }
  },
})
