import { v } from 'convex/values'
import { query } from './_generated/server'
import { api, internal } from './_generated/api'
import { authedMutation } from './lib/customFunctions'
import { requireOrgMember, requireShopAccess } from './lib/auth'
import {
  isSubscriptionActive,
  subscriptionStatusValidator,
} from './lib/validators'
import type { MutationCtx } from './_generated/server'

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  return slug.length > 0 ? slug : null
}

const ensureUniqueSlug = async (ctx: MutationCtx, baseSlug: string) => {
  const existing = await ctx.db
    .query('shops')
    .withIndex('by_slug', (q) => q.eq('slug', baseSlug))
    .unique()
  if (!existing) {
    return baseSlug
  }

  for (let suffix = 2; suffix < Number.MAX_SAFE_INTEGER; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`
    const taken = await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .unique()
    if (!taken) {
      return candidate
    }
  }
  return baseSlug
}

const shopValidator = v.object({
  _id: v.id('shops'),
  _creationTime: v.number(),
  organizationId: v.id('organizations'),
  name: v.string(),
  teamLabel: v.optional(v.string()),
  slug: v.string(),
  swishNumber: v.string(),
  createdEmailSentAt: v.optional(v.number()),
  createdAt: v.number(),
})

export const getShopById = query({
  args: {
    shopId: v.id('shops'),
  },
  returns: v.union(shopValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get('shops', args.shopId)
  },
})

export const getShopBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(shopValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
  },
})

export const getOrganizationLogoUrlByShopSlug = query({
  args: { slug: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const shop = await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (!shop) {
      return null
    }
    const organization = await ctx.db.get('organizations', shop.organizationId)
    if (!organization?.logoStorageId) {
      return null
    }
    return await ctx.storage.getUrl(organization.logoStorageId)
  },
})

export const getShopWithLicenseBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      shop: shopValidator,
      organization: v.object({
        _id: v.id('organizations'),
        name: v.string(),
        subscriptionStatus: subscriptionStatusValidator,
        trialEndsAt: v.optional(v.number()),
      }),
      licenseActive: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const shop = await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (!shop) {
      return null
    }

    const organization = await ctx.db.get('organizations', shop.organizationId)
    if (!organization) {
      return null
    }

    const licenseActive = isSubscriptionActive(organization.subscriptionStatus)

    return {
      shop,
      organization: {
        _id: organization._id,
        name: organization.name,
        subscriptionStatus: organization.subscriptionStatus,
        trialEndsAt: organization.trialEndsAt,
      },
      licenseActive,
    }
  },
})

export const updateShop = authedMutation({
  args: {
    shopId: v.id('shops'),
    name: v.string(),
    swishNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    await ctx.db.patch('shops', args.shopId, {
      name: args.name.trim(),
      swishNumber: args.swishNumber.trim(),
    })
    return null
  },
})

export const deleteShop = authedMutation({
  args: {
    shopId: v.id('shops'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId, ['owner', 'treasurer'])

    const products = await ctx.db
      .query('products')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .collect()
    for (const product of products) {
      await ctx.db.delete('products', product._id)
    }

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .collect()
    for (const transaction of transactions) {
      await ctx.db.delete('transactions', transaction._id)
    }

    await ctx.db.delete('shops', args.shopId)
    return null
  },
})

export const createShopInOrganization = authedMutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
    swishNumber: v.string(),
    slug: v.optional(v.string()),
    products: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
      }),
    ),
  },
  returns: v.object({
    shopId: v.id('shops'),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireOrgMember(ctx, args.organizationId, ['owner', 'treasurer'])

    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const shopName = args.name.trim()
    if (!shopName) {
      throw new Error('Kiosknamn krävs.')
    }

    const baseSlug = slugify(args.slug ?? shopName)
    if (!baseSlug) {
      throw new Error('Ogiltigt kiosknamn eller slug.')
    }

    const existing = await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', baseSlug))
      .unique()
    if (existing && args.slug) {
      throw new Error('Slug är redan upptagen.')
    }

    const finalSlug = existing
      ? await ensureUniqueSlug(ctx, baseSlug)
      : baseSlug

    const now = Date.now()
    const shopId = await ctx.db.insert('shops', {
      organizationId: args.organizationId,
      name: shopName,
      slug: finalSlug,
      swishNumber: args.swishNumber.trim(),
      createdAt: now,
    })

    for (const product of args.products) {
      await ctx.db.insert('products', {
        shopId,
        name: product.name,
        price: product.price,
        createdAt: Date.now(),
      })
    }

    await ctx.scheduler.runAfter(0, api.email.sendStoreCreatedEmail, {
      to: organization.billingEmail,
      shopName,
      shopSlug: finalSlug,
      shopId,
    })
    await ctx.db.patch('shops', shopId, {
      createdEmailSentAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.platformEvents.recordInternal, {
      type: 'shop_created',
      createdAt: now,
      organizationId: args.organizationId,
      shopId,
      shopSlug: finalSlug,
      shopName,
      organizationName: organization.name,
      actorEmail: ctx.user.email,
    })

    return { shopId, slug: finalSlug }
  },
})

export const checkSlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.object({
    isAvailable: v.boolean(),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const slug = slugify(args.slug)
    if (!slug) {
      return { isAvailable: false, slug: '' }
    }

    const existing = await ctx.db
      .query('shops')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()

    return {
      isAvailable: !existing,
      slug,
    }
  },
})
