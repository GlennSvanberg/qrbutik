import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  shops: defineTable({
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
  })
    .index('by_slug', ['slug'])
    .index('by_ownerEmail', ['ownerEmail'])
    .index('by_activationStatus_activeUntil', [
      'activationStatus',
      'activeUntil',
    ]),
  shopActivations: defineTable({
    shopId: v.id('shops'),
    plan: v.union(v.literal('event'), v.literal('season')),
    amount: v.number(),
    message: v.string(),
    activeFrom: v.number(),
    activeUntil: v.number(),
    verificationStatus: v.union(v.literal('unverified'), v.literal('verified')),
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_shopId', ['shopId']),
  products: defineTable({
    shopId: v.id('shops'),
    name: v.string(),
    price: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_shopId', ['shopId']),
  transactions: defineTable({
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
  }).index('by_shopId', ['shopId']),
  devMagicLinks: defineTable({
    email: v.string(),
    url: v.string(),
    updatedAt: v.number(),
  }).index('by_email', ['email']),
})
