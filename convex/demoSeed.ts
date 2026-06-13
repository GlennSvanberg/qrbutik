import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

export const DEMO_SHOP_SLUG = 'demo'

const DEMO_ORG_NAME = 'QRButik Demo IF'
const DEMO_BILLING_EMAIL = 'demo@qrbutik.se'
const DEMO_SHOP_NAME = 'Demokiosk'
const DEMO_SWISH_NUMBER = '1234567890'

const DEMO_PRODUCTS = [
  { name: 'Korv med bröd', price: 25 },
  { name: 'Kaffe', price: 20 },
  { name: 'Te', price: 15 },
  { name: 'Läsk 33 cl', price: 25 },
  { name: 'Vatten', price: 15 },
  { name: 'Chips', price: 20 },
  { name: 'Muffins', price: 30 },
  { name: 'Frukt', price: 10 },
] as const

async function ensureDemoOrganization(ctx: MutationCtx): Promise<Id<'organizations'>> {
  const existingShop = await ctx.db
    .query('shops')
    .withIndex('by_slug', (q) => q.eq('slug', DEMO_SHOP_SLUG))
    .unique()

  if (existingShop) {
    const organization = await ctx.db.get('organizations', existingShop.organizationId)
    if (organization) {
      await ctx.db.patch('organizations', organization._id, {
        name: DEMO_ORG_NAME,
        billingEmail: DEMO_BILLING_EMAIL,
        subscriptionStatus: 'active',
      })
      return organization._id
    }
  }

  return await ctx.db.insert('organizations', {
    name: DEMO_ORG_NAME,
    billingEmail: DEMO_BILLING_EMAIL,
    subscriptionStatus: 'active',
    createdAt: Date.now(),
  })
}

async function ensureDemoShopRecord(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
): Promise<Id<'shops'>> {
  const existingShop = await ctx.db
    .query('shops')
    .withIndex('by_slug', (q) => q.eq('slug', DEMO_SHOP_SLUG))
    .unique()

  if (existingShop) {
    await ctx.db.patch('shops', existingShop._id, {
      name: DEMO_SHOP_NAME,
      swishNumber: DEMO_SWISH_NUMBER,
    })
    return existingShop._id
  }

  return await ctx.db.insert('shops', {
    organizationId,
    name: DEMO_SHOP_NAME,
    slug: DEMO_SHOP_SLUG,
    swishNumber: DEMO_SWISH_NUMBER,
    createdAt: Date.now(),
  })
}

async function syncDemoProducts(
  ctx: MutationCtx,
  shopId: Id<'shops'>,
): Promise<number> {
  const existingProducts = await ctx.db
    .query('products')
    .withIndex('by_shopId', (q) => q.eq('shopId', shopId))
    .collect()

  const desiredByName = new Map<string, number>(
    DEMO_PRODUCTS.map((product) => [product.name, product.price]),
  )
  const now = Date.now()

  for (const product of existingProducts) {
    const desiredPrice = desiredByName.get(product.name)
    if (desiredPrice === undefined) {
      await ctx.db.delete('products', product._id)
      continue
    }

    if (product.price !== desiredPrice) {
      await ctx.db.patch('products', product._id, {
        name: product.name,
        price: desiredPrice,
      })
    }

    desiredByName.delete(product.name)
  }

  for (const [name, price] of desiredByName) {
    await ctx.db.insert('products', {
      shopId,
      name,
      price,
      createdAt: now,
    })
  }

  return DEMO_PRODUCTS.length
}

export const ensureDemoShop = internalMutation({
  args: {},
  returns: v.object({
    organizationId: v.id('organizations'),
    shopId: v.id('shops'),
    slug: v.string(),
    productCount: v.number(),
  }),
  handler: async (ctx) => {
    const organizationId = await ensureDemoOrganization(ctx)
    const shopId = await ensureDemoShopRecord(ctx, organizationId)
    const productCount = await syncDemoProducts(ctx, shopId)

    return {
      organizationId,
      shopId,
      slug: DEMO_SHOP_SLUG,
      productCount,
    }
  },
})
