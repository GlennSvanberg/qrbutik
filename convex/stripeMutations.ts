import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import { EVENT_DURATION_MS } from './lib/plans'
import { mapStripeSubscriptionStatus } from './lib/stripeHelpers'
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
    const organizationId = args.organizationId as Id<'organizations'>
    const organization = await ctx.db.get('organizations', organizationId)
    if (!organization) {
      return null
    }

    const mappedStatus = mapStripeSubscriptionStatus(args.subscriptionStatus)

    await ctx.db.patch('organizations', organization._id, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: mappedStatus,
      plan: 'season',
    })

    if (
      mappedStatus === 'active' &&
      organization.subscriptionActivatedEmailSentAt === undefined
    ) {
      await ctx.db.patch('organizations', organization._id, {
        subscriptionActivatedEmailSentAt: Date.now(),
      })

      await ctx.scheduler.runAfter(
        0,
        internal.email.sendSubscriptionActivatedEmail,
        {
          to: organization.billingEmail,
          organizationName: organization.name,
          organizationId: organization._id,
        },
      )

      await ctx.scheduler.runAfter(0, internal.platformEvents.recordInternal, {
        type: 'subscription_activated',
        createdAt: Date.now(),
        organizationId: organization._id,
        organizationName: organization.name,
      })
    }

    return null
  },
})

export const handleEventCheckoutCompleted = internalMutation({
  args: {
    organizationId: v.string(),
    stripeCustomerId: v.string(),
    checkoutSessionId: v.string(),
    purchasedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organizationId = args.organizationId as Id<'organizations'>
    const organization = await ctx.db.get('organizations', organizationId)
    if (!organization) {
      return null
    }

    if (organization.eventCheckoutSessionId === args.checkoutSessionId) {
      return null
    }

    const seasonActive =
      organization.plan === 'season' && organization.subscriptionStatus === 'active'
    const legacyActive =
      organization.plan !== 'season' &&
      organization.stripeSubscriptionId !== undefined &&
      (organization.subscriptionStatus === 'active' ||
        organization.subscriptionStatus === 'trialing')

    await ctx.db.patch('organizations', organization._id, {
      stripeCustomerId: args.stripeCustomerId,
      eventCheckoutSessionId: args.checkoutSessionId,
    })

    if (seasonActive || legacyActive) {
      return null
    }

    const eventExpiresAt = Math.max(
      organization.eventExpiresAt ?? 0,
      args.purchasedAt + EVENT_DURATION_MS,
    )

    await ctx.db.patch('organizations', organization._id, {
      plan: 'event',
      eventExpiresAt,
      eventActivatedEmailSentAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.email.sendEventActivatedEmail, {
      to: organization.billingEmail,
      organizationName: organization.name,
      organizationId: organization._id,
      eventExpiresAt,
    })

    return null
  },
})

export const handleSubscriptionUpdated = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    subscriptionStatus: stripeSubscriptionStatusValidator,
    plan: v.optional(v.union(v.literal('season'), v.literal('gratis'))),
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

    const mappedStatus = mapStripeSubscriptionStatus(args.subscriptionStatus)

    await ctx.db.patch('organizations', organization._id, {
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: mappedStatus,
      ...(args.plan === 'season' ? { plan: 'season' as const } : {}),
    })

    if (
      mappedStatus === 'active' &&
      organization.subscriptionActivatedEmailSentAt === undefined
    ) {
      await ctx.db.patch('organizations', organization._id, {
        subscriptionActivatedEmailSentAt: Date.now(),
      })

      await ctx.scheduler.runAfter(
        0,
        internal.email.sendSubscriptionActivatedEmail,
        {
          to: organization.billingEmail,
          organizationName: organization.name,
          organizationId: organization._id,
        },
      )

      await ctx.scheduler.runAfter(0, internal.platformEvents.recordInternal, {
        type: 'subscription_activated',
        createdAt: Date.now(),
        organizationId: organization._id,
        organizationName: organization.name,
      })
    }

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

    const oneDayMs = 24 * 60 * 60 * 1000
    const recentlyNotified =
      organization.paymentFailedEmailSentAt !== undefined &&
      Date.now() - organization.paymentFailedEmailSentAt < oneDayMs

    if (!recentlyNotified) {
      await ctx.db.patch('organizations', organization._id, {
        paymentFailedEmailSentAt: Date.now(),
      })

      await ctx.scheduler.runAfter(0, internal.email.sendPaymentFailedEmail, {
        to: organization.billingEmail,
        organizationName: organization.name,
        organizationId: organization._id,
      })
    }

    return null
  },
})
