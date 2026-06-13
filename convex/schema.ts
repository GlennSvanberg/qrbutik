import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const subscriptionStatusValidator = v.union(
  v.literal('trialing'),
  v.literal('active'),
  v.literal('past_due'),
  v.literal('canceled'),
  v.literal('inactive'),
)

const orgRoleValidator = v.union(
  v.literal('owner'),
  v.literal('treasurer'),
  v.literal('editor'),
)

const platformEventTypeValidator = v.union(
  v.literal('org_created'),
  v.literal('shop_created'),
  v.literal('checkout_started'),
  v.literal('subscription_activated'),
  v.literal('shop_view'),
  v.literal('page_view'),
)

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    orgNumber: v.optional(v.string()),
    sieRevenueAccount: v.optional(v.string()),
    billingEmail: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: subscriptionStatusValidator,
    trialEndsAt: v.optional(v.number()),
    trialWelcomeEmailSentAt: v.optional(v.number()),
    trialReminderEmailSentAt: v.optional(v.number()),
    trialExpiredEmailSentAt: v.optional(v.number()),
    subscriptionActivatedEmailSentAt: v.optional(v.number()),
    paymentFailedEmailSentAt: v.optional(v.number()),
    createdAt: v.number(),
    logoStorageId: v.optional(v.id('_storage')),
  }).index('by_stripeCustomerId', ['stripeCustomerId']),
  organizationMembers: defineTable({
    organizationId: v.id('organizations'),
    email: v.string(),
    tokenIdentifier: v.optional(v.string()),
    role: orgRoleValidator,
    assignedShopIds: v.optional(v.array(v.id('shops'))),
    createdAt: v.number(),
  })
    .index('by_organizationId_and_email', ['organizationId', 'email'])
    .index('by_organizationId', ['organizationId'])
    .index('by_email', ['email']),
  organizationInvitations: defineTable({
    organizationId: v.id('organizations'),
    email: v.string(),
    role: v.union(v.literal('treasurer'), v.literal('editor')),
    assignedShopIds: v.optional(v.array(v.id('shops'))),
    token: v.string(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    invitedByEmail: v.string(),
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_and_email', ['organizationId', 'email']),
  shops: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    teamLabel: v.optional(v.string()),
    slug: v.string(),
    swishNumber: v.string(),
    createdEmailSentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_organizationId', ['organizationId']),
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
  })
    .index('by_shopId', ['shopId'])
    .index('by_shopId_and_createdAt', ['shopId', 'createdAt']),
  stripeEvents: defineTable({
    eventId: v.string(),
    processedAt: v.number(),
  }).index('by_eventId', ['eventId']),
  devMagicLinks: defineTable({
    email: v.string(),
    url: v.string(),
    updatedAt: v.number(),
  }).index('by_email', ['email']),
  platformEvents: defineTable({
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
  }).index('by_createdAt', ['createdAt']),
  platformReportState: defineTable({
    lastReportSentAt: v.number(),
  }),
})
