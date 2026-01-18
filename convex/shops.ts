import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { api } from './_generated/api'
import type { MutationCtx } from './_generated/server'

const seasonDurationMs = 180 * 24 * 60 * 60 * 1000
const eventDurationMs = 48 * 60 * 60 * 1000

const getEndOfDayTimestamp = (timeMs: number) => {
  const date = new Date(timeMs)
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  ).getTime()
}

const resolveActivationWindow = ({
  plan,
  now,
  currentActiveUntil,
  isCurrentlyActive,
}: {
  plan: 'event' | 'season'
  now: number
  currentActiveUntil: number
  isCurrentlyActive: boolean
}) => {
  if (plan === 'season') {
    const start = now
    return { start, end: start + seasonDurationMs }
  }

  if (isCurrentlyActive && currentActiveUntil > now) {
    return { start: now, end: currentActiveUntil + eventDurationMs }
  }

  const endOfDay = getEndOfDayTimestamp(now)
  return { start: now, end: endOfDay + eventDurationMs }
}

const normalizeActivationFields = (shop: {
  activationStatus?: 'inactive' | 'active'
  verificationStatus?: 'unverified' | 'verified'
  activationPlan?: 'event' | 'season'
  activeFrom?: number
  activeUntil?: number
  lastActivatedAt?: number
}) => {
  return {
    activationStatus: shop.activationStatus ?? 'inactive',
    verificationStatus: shop.verificationStatus ?? 'unverified',
    activationPlan: shop.activationPlan,
    activeFrom: shop.activeFrom ?? 0,
    activeUntil: shop.activeUntil ?? 0,
    lastActivatedAt: shop.lastActivatedAt ?? 0,
  }
}

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

export const createShop = mutation({
  args: {
    name: v.string(),
    ownerEmail: v.string(),
    swishNumber: v.string(),
    slug: v.optional(v.string()),
  },
  returns: v.object({
    shopId: v.id('shops'),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const baseSlug = slugify(args.slug ?? args.name)
    if (!baseSlug) {
      throw new Error('Ogiltigt butiksnamn eller slug.')
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
      name: args.name,
      slug: finalSlug,
      ownerEmail: args.ownerEmail,
      swishNumber: args.swishNumber,
      activationStatus: 'inactive',
      verificationStatus: 'unverified',
      activationPlan: undefined,
      activeFrom: 0,
      activeUntil: 0,
      lastActivatedAt: 0,
      createdAt: now,
    })

    return { shopId, slug: finalSlug }
  },
})

export const createShopWithProducts = mutation({
  args: {
    name: v.string(),
    ownerEmail: v.string(),
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
    const baseSlug = slugify(args.slug ?? args.name)
    if (!baseSlug) {
      throw new Error('Ogiltigt butiksnamn eller slug.')
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
      name: args.name,
      slug: finalSlug,
      ownerEmail: args.ownerEmail,
      swishNumber: args.swishNumber,
      activationStatus: 'inactive',
      verificationStatus: 'unverified',
      activationPlan: undefined,
      activeFrom: 0,
      activeUntil: 0,
      lastActivatedAt: 0,
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

    return { shopId, slug: finalSlug }
  },
})

export const getShopById = query({
  args: {
    shopId: v.id('shops'),
  },
  returns: v.union(
    v.object({
      _id: v.id('shops'),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      ownerEmail: v.string(),
      swishNumber: v.string(),
      activationStatus: v.optional(
        v.union(v.literal('inactive'), v.literal('active')),
      ),
      verificationStatus: v.optional(
        v.union(v.literal('unverified'), v.literal('verified')),
      ),
      activationPlan: v.optional(
        v.union(v.literal('event'), v.literal('season')),
      ),
      activeFrom: v.optional(v.number()),
      activeUntil: v.optional(v.number()),
      lastActivatedAt: v.optional(v.number()),
      createdEmailSentAt: v.optional(v.number()),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      return null
    }
    const normalized = normalizeActivationFields(shop)
    return {
      _id: shop._id,
      _creationTime: shop._creationTime,
      name: shop.name,
      slug: shop.slug,
      ownerEmail: shop.ownerEmail,
      swishNumber: shop.swishNumber,
      activationStatus: normalized.activationStatus,
      verificationStatus: normalized.verificationStatus,
      activationPlan: normalized.activationPlan,
      activeFrom: normalized.activeFrom,
      activeUntil: normalized.activeUntil,
      lastActivatedAt: normalized.lastActivatedAt,
      createdEmailSentAt: shop.createdEmailSentAt,
      createdAt: shop.createdAt,
    }
  },
})

export const verifyShopActivation = mutation({
  args: {
    shopId: v.id('shops'),
    activationId: v.id('shopActivations'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const activation = await ctx.db.get('shopActivations', args.activationId)
    if (!activation || activation.shopId !== args.shopId) {
      throw new Error('Aktiveringen hittades inte.')
    }

    const now = Date.now()
    await ctx.db.patch('shopActivations', args.activationId, {
      verificationStatus: 'verified',
      verifiedAt: now,
    })

    const shop = await ctx.db.get('shops', args.shopId)
    if (shop) {
      await ctx.db.patch('shops', args.shopId, {
        verificationStatus: 'verified',
      })
    }

    return null
  },
})

export const activateShop = mutation({
  args: {
    shopId: v.id('shops'),
    plan: v.union(v.literal('event'), v.literal('season')),
  },
  returns: v.object({
    shopId: v.id('shops'),
    activationStatus: v.union(v.literal('inactive'), v.literal('active')),
    verificationStatus: v.union(v.literal('unverified'), v.literal('verified')),
    activeFrom: v.number(),
    activeUntil: v.number(),
    amount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      throw new Error('Butiken hittades inte.')
    }

    const now = Date.now()
    const normalized = normalizeActivationFields(shop)
    const isCurrentlyActive = normalized.activationStatus === 'active'
    const { start, end } = resolveActivationWindow({
      plan: args.plan,
      now,
      currentActiveUntil: normalized.activeUntil,
      isCurrentlyActive,
    })

    const amount = args.plan === 'season' ? 99 : 10
    const message = `QRB-AKT ${shop._id} ${shop.slug} ${shop.name}`

    await ctx.db.patch('shops', args.shopId, {
      activationStatus: 'active',
      verificationStatus: 'unverified',
      activationPlan: args.plan,
      activeFrom: start,
      activeUntil: end,
      lastActivatedAt: now,
    })

    if (!shop.createdEmailSentAt) {
      await ctx.scheduler.runAfter(0, api.email.sendStoreCreatedEmail, {
        to: shop.ownerEmail,
        shopName: shop.name,
        shopSlug: shop.slug,
        shopId: shop._id,
      })
      await ctx.db.patch('shops', args.shopId, {
        createdEmailSentAt: now,
      })
    }

    await ctx.db.insert('shopActivations', {
      shopId: shop._id,
      plan: args.plan,
      amount,
      message,
      activeFrom: start,
      activeUntil: end,
      verificationStatus: 'unverified',
      createdAt: now,
    })

    await ctx.scheduler.runAt(end, api.shops.deactivateShopIfExpired, {
      shopId: shop._id,
      expectedActiveUntil: end,
    })

    return {
      shopId: shop._id,
      activationStatus: 'active' as const,
      verificationStatus: 'unverified' as const,
      activeFrom: start,
      activeUntil: end,
      amount,
      message,
    }
  },
})

export const deactivateShopIfExpired = mutation({
  args: {
    shopId: v.id('shops'),
    expectedActiveUntil: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      return null
    }
    if (shop.activationStatus !== 'active') {
      return null
    }
    if (shop.activeUntil !== args.expectedActiveUntil) {
      return null
    }
    if (shop.activeUntil > Date.now()) {
      return null
    }

    await ctx.db.patch('shops', args.shopId, {
      activationStatus: 'inactive',
      activationPlan: shop.activationPlan ?? undefined,
    })

    return null
  },
})

export const listShopActivations = query({
  args: { shopId: v.id('shops') },
  returns: v.array(
    v.object({
      _id: v.id('shopActivations'),
      _creationTime: v.number(),
      shopId: v.id('shops'),
      plan: v.union(v.literal('event'), v.literal('season')),
      amount: v.number(),
      message: v.string(),
      activeFrom: v.number(),
      activeUntil: v.number(),
      verificationStatus: v.union(
        v.literal('unverified'),
        v.literal('verified'),
      ),
      verifiedAt: v.optional(v.number()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('shopActivations')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .order('desc')
      .collect()
  },
})

export const getShopBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id('shops'),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      ownerEmail: v.string(),
      swishNumber: v.string(),
      activationStatus: v.union(v.literal('inactive'), v.literal('active')),
      verificationStatus: v.union(
        v.literal('unverified'),
        v.literal('verified'),
      ),
      activationPlan: v.optional(
        v.union(v.literal('event'), v.literal('season')),
      ),
      activeFrom: v.number(),
      activeUntil: v.number(),
      lastActivatedAt: v.number(),
      createdAt: v.number(),
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
    const normalized = normalizeActivationFields(shop)
    return {
      ...shop,
      activationStatus: normalized.activationStatus,
      verificationStatus: normalized.verificationStatus,
      activationPlan: normalized.activationPlan,
      activeFrom: normalized.activeFrom,
      activeUntil: normalized.activeUntil,
      lastActivatedAt: normalized.lastActivatedAt,
    }
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

export const listByOwnerEmail = query({
  args: {
    ownerEmail: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id('shops'),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      ownerEmail: v.string(),
      swishNumber: v.string(),
      activationStatus: v.union(v.literal('inactive'), v.literal('active')),
      verificationStatus: v.union(
        v.literal('unverified'),
        v.literal('verified'),
      ),
      activationPlan: v.optional(
        v.union(v.literal('event'), v.literal('season')),
      ),
      activeFrom: v.number(),
      activeUntil: v.number(),
      lastActivatedAt: v.number(),
      createdEmailSentAt: v.optional(v.number()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const shops = await ctx.db
      .query('shops')
      .withIndex('by_ownerEmail', (q) => q.eq('ownerEmail', args.ownerEmail))
      .order('desc')
      .collect()

    return shops.map((shop) => {
      const normalized = normalizeActivationFields(shop)
      return {
        ...shop,
        activationStatus: normalized.activationStatus,
        verificationStatus: normalized.verificationStatus,
        activationPlan: normalized.activationPlan,
        activeFrom: normalized.activeFrom,
        activeUntil: normalized.activeUntil,
        lastActivatedAt: normalized.lastActivatedAt,
      }
    })
  },
})
