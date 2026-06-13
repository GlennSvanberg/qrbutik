import { v } from 'convex/values'
import { internalMutation, mutation } from './_generated/server'
import {
  platformEventTypeValidator,
  recordPlatformEvent,
} from './lib/platformEvents'
import { isE2eTestShopSlug } from './lib/testData'
import type { PlatformEventInput } from './lib/platformEvents'

const recordEventArgsValidator = {
  type: platformEventTypeValidator,
  createdAt: v.number(),
  organizationId: v.optional(v.id('organizations')),
  shopId: v.optional(v.id('shops')),
  shopSlug: v.optional(v.string()),
  shopName: v.optional(v.string()),
  organizationName: v.optional(v.string()),
  amountKr: v.optional(v.number()),
  transactionId: v.optional(v.id('transactions')),
  path: v.optional(v.string()),
  visitorId: v.optional(v.string()),
  actorEmail: v.optional(v.string()),
}

export const recordInternal = internalMutation({
  args: recordEventArgsValidator,
  returns: v.union(v.id('platformEvents'), v.null()),
  handler: async (ctx, args) => {
    return await recordPlatformEvent(ctx, args as PlatformEventInput)
  },
})

const visitTypeValidator = v.union(v.literal('shop_view'), v.literal('page_view'))

function isAllowedPagePath(path: string): boolean {
  if (path === '/' || path === '/glenn' || path === '/kontakt') {
    return true
  }
  return path.startsWith('/utforska/')
}

export const recordVisit = mutation({
  args: {
    type: visitTypeValidator,
    visitorId: v.string(),
    path: v.optional(v.string()),
    shopSlug: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const visitorId = args.visitorId.trim()
    if (!visitorId || visitorId.length > 128) {
      return null
    }

    if (args.type === 'page_view') {
      const path = args.path?.trim()
      if (!path || !isAllowedPagePath(path)) {
        return null
      }
      await recordPlatformEvent(ctx, {
        type: 'page_view',
        createdAt: Date.now(),
        path,
        visitorId,
      })
      return null
    }

    const shopSlug = args.shopSlug?.trim()
    if (!shopSlug || isE2eTestShopSlug(shopSlug)) {
      return null
    }

    const shop = await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', shopSlug))
      .unique()

    if (!shop) {
      return null
    }

    await recordPlatformEvent(ctx, {
      type: 'shop_view',
      createdAt: Date.now(),
      shopId: shop._id,
      shopSlug: shop.slug,
      shopName: shop.name,
      organizationId: shop.organizationId,
      visitorId,
    })

    return null
  },
})
