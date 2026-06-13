import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import type { SubscriptionStatus } from './lib/validators'
import type { Id } from './_generated/dataModel'

const stripeSubscriptionStatusValidator = v.union(
  v.literal('active'),
  v.literal('trialing'),
  v.literal('past_due'),
  v.literal('canceled'),
  v.literal('unpaid'),
  v.literal('incomplete'),
  v.literal('incomplete_expired'),
  v.literal('paused'),
)

function mapStripeSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return status
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    default:
      return 'inactive'
  }
}

export const recordStripeEvent = internalMutation({
  args: {
    eventId: v.string(),
    processedAt: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('stripeEvents')
      .withIndex('by_eventId', (q) => q.eq('eventId', args.eventId))
      .unique()

    if (existing) {
      return false
    }

    await ctx.db.insert('stripeEvents', {
      eventId: args.eventId,
      processedAt: args.processedAt,
    })

    return true
  },
})

export const handleCheckoutCompleted = internalMutation({
  args: {
    organizationId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    subscriptionStatus: stripeSubscriptionStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(
      'organizations',
      args.organizationId as Id<'organizations'>,
    )
    if (!organization) {
      return null
    }

    await ctx.db.patch('organizations', organization._id, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: mapStripeSubscriptionStatus(args.subscriptionStatus),
    })

    return null
  },
})

export const handleSubscriptionUpdated = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    subscriptionStatus: stripeSubscriptionStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_stripeCustomerId', (q) =>
        q.eq('stripeCustomerId', args.stripeCustomerId),
      )
      .unique()

    if (!organization) {
      return null
    }

    await ctx.db.patch('organizations', organization._id, {
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: mapStripeSubscriptionStatus(args.subscriptionStatus),
    })

    return null
  },
})

export const handlePaymentFailed = internalMutation({
  args: {
    stripeCustomerId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_stripeCustomerId', (q) =>
        q.eq('stripeCustomerId', args.stripeCustomerId),
      )
      .unique()

    if (!organization) {
      return null
    }

    await ctx.db.patch('organizations', organization._id, {
      subscriptionStatus: 'past_due',
    })

    return null
  },
})
