import { v } from 'convex/values'
import { internalQuery } from './_generated/server'
import { normalizeEmail, orgRoleValidator } from './lib/validators'

export const getOrganizationForStripe = internalQuery({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.union(
    v.object({
      _id: v.id('organizations'),
      name: v.string(),
      billingEmail: v.string(),
      stripeCustomerId: v.optional(v.string()),
      subscriptionStatus: v.union(
        v.literal('trialing'),
        v.literal('active'),
        v.literal('past_due'),
        v.literal('canceled'),
        v.literal('inactive'),
      ),
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
      stripeCustomerId: organization.stripeCustomerId,
      subscriptionStatus: organization.subscriptionStatus,
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
