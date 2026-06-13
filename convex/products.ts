import { v } from 'convex/values'
import { query } from './_generated/server'
import { authedMutation } from './lib/customFunctions'
import { requireShopAccess } from './lib/auth'

const productValidator = v.object({
  _id: v.id('products'),
  _creationTime: v.number(),
  shopId: v.id('shops'),
  name: v.string(),
  price: v.number(),
  description: v.optional(v.string()),
  createdAt: v.number(),
})

export const listByShop = query({
  args: {
    shopId: v.id('shops'),
  },
  returns: v.array(productValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_shopId', (q) => q.eq('shopId', args.shopId))
      .order('asc')
      .collect()
  },
})

export const addProduct = authedMutation({
  args: {
    shopId: v.id('shops'),
    name: v.string(),
    price: v.number(),
  },
  returns: v.id('products'),
  handler: async (ctx, args) => {
    await requireShopAccess(ctx, args.shopId)
    return await ctx.db.insert('products', {
      shopId: args.shopId,
      name: args.name.trim(),
      price: args.price,
      createdAt: Date.now(),
    })
  },
})

export const updateProduct = authedMutation({
  args: {
    productId: v.id('products'),
    name: v.string(),
    price: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get('products', args.productId)
    if (!product) {
      throw new Error('Produkten hittades inte.')
    }
    await requireShopAccess(ctx, product.shopId)
    await ctx.db.patch('products', args.productId, {
      name: args.name.trim(),
      price: args.price,
    })
    return null
  },
})

export const deleteProduct = authedMutation({
  args: {
    productId: v.id('products'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get('products', args.productId)
    if (!product) {
      throw new Error('Produkten hittades inte.')
    }
    await requireShopAccess(ctx, product.shopId)
    await ctx.db.delete('products', args.productId)
    return null
  },
})
