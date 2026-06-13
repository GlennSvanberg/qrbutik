import { v } from 'convex/values'
import { internalQuery } from './_generated/server'
import { normalizeEmail, orgRoleValidator, subscriptionStatusValidator } from './lib/validators'

export const getOrganizationForStripe = internalQuery({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.union(
    v.object({
      _id: v.id('organizations'),
      name: v.string(),
      billingEmail: v.string(),
      orgNumber: v.optional(v.string()),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      subscriptionStatus: subscriptionStatusValidator,
      trialEndsAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      return null
    }

    return {
      _id: organization._id,
      name: organization.name,
      billingEmail: organization.billingEmail,
      orgNumber: organization.orgNumber,
      stripeCustomerId: organization.stripeCustomerId,
      stripeSubscriptionId: organization.stripeSubscriptionId,
      subscriptionStatus: organization.subscriptionStatus,
      trialEndsAt: organization.trialEndsAt,
    }
  },
})

export const getMembershipForUser = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    email: v.string(),
  },
  returns: v.union(
    v.object({
      role: orgRoleValidator,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organizationId_and_email', (q) =>
        q
          .eq('organizationId', args.organizationId)
          .eq('email', normalizeEmail(args.email)),
      )
      .unique()

    if (!membership) {
      return null
    }

    return { role: membership.role }
  },
})

export const getOrganizationByStripeCustomer = internalQuery({
  args: {
    stripeCustomerId: v.string(),
  },
  returns: v.union(v.id('organizations'), v.null()),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_stripeCustomerId', (q) =>
        q.eq('stripeCustomerId', args.stripeCustomerId),
      )
      .unique()

    return organization?._id ?? null
  },
})

export const getOrganizationBillingContact = internalQuery({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.union(
    v.object({
      name: v.string(),
      billingEmail: v.string(),
      subscriptionActivatedEmailSentAt: v.optional(v.number()),
      paymentFailedEmailSentAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      return null
    }

    return {
      name: organization.name,
      billingEmail: organization.billingEmail,
      subscriptionActivatedEmailSentAt:
        organization.subscriptionActivatedEmailSentAt,
      paymentFailedEmailSentAt: organization.paymentFailedEmailSentAt,
    }
  },
})

export const getOrganizationBillingContactByStripeCustomer = internalQuery({
  args: {
    stripeCustomerId: v.string(),
  },
  returns: v.union(
    v.object({
      organizationId: v.id('organizations'),
      name: v.string(),
      billingEmail: v.string(),
      paymentFailedEmailSentAt: v.optional(v.number()),
    }),
    v.null(),
  ),
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

    return {
      organizationId: organization._id,
      name: organization.name,
      billingEmail: organization.billingEmail,
      paymentFailedEmailSentAt: organization.paymentFailedEmailSentAt,
    }
  },
})
