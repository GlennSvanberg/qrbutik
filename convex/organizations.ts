import { v } from 'convex/values'

import { internalMutation } from './_generated/server'

import { authedMutation, authedQuery, orgQuery } from './lib/customFunctions'

import { normalizeEmail, subscriptionStatusValidator } from './lib/validators'



const TRIAL_DAYS = 14

const trialDurationMs = TRIAL_DAYS * 24 * 60 * 60 * 1000



const organizationSummaryValidator = v.object({

  _id: v.id('organizations'),

  _creationTime: v.number(),

  name: v.string(),

  orgNumber: v.optional(v.string()),

  billingEmail: v.string(),

  stripeCustomerId: v.optional(v.string()),

  stripeSubscriptionId: v.optional(v.string()),

  subscriptionStatus: subscriptionStatusValidator,

  trialEndsAt: v.optional(v.number()),

  createdAt: v.number(),

  role: v.union(

    v.literal('owner'),

    v.literal('treasurer'),

    v.literal('editor'),

  ),

})



const shopSummaryValidator = v.object({

  _id: v.id('shops'),

  _creationTime: v.number(),

  organizationId: v.id('organizations'),

  name: v.string(),

  slug: v.string(),

  swishNumber: v.string(),

  createdEmailSentAt: v.optional(v.number()),

  createdAt: v.number(),

})



export const getMyOrganizations = authedQuery({

  args: {},

  returns: v.array(organizationSummaryValidator),

  handler: async (ctx) => {

    const email = normalizeEmail(ctx.user.email)

    const memberships = await ctx.db

      .query('organizationMembers')

      .withIndex('by_email', (q) => q.eq('email', email))

      .collect()



    const organizations = []

    for (const membership of memberships) {

      const organization = await ctx.db.get(

        'organizations',

        membership.organizationId,

      )

      if (!organization) {

        continue

      }

      organizations.push({

        ...organization,

        role: membership.role,

      })

    }



    return organizations.sort((a, b) => b.createdAt - a.createdAt)

  },

})



export const getOrganization = orgQuery({

  args: { organizationId: v.id('organizations') },

  returns: organizationSummaryValidator,

  handler: async (ctx, args) => {

    const organization = await ctx.db.get('organizations', args.organizationId)

    if (!organization) {

      throw new Error('Föreningen hittades inte.')

    }



    return {

      ...organization,

      role: ctx.membership.role,

    }

  },

})



export const listOrganizationShops = orgQuery({

  args: { organizationId: v.id('organizations') },

  returns: v.array(shopSummaryValidator),

  handler: async (ctx, args) => {

    return await ctx.db

      .query('shops')

      .withIndex('by_organizationId', (q) =>

        q.eq('organizationId', args.organizationId),

      )

      .order('desc')

      .collect()

  },

})



export const createOrganization = authedMutation({

  args: {

    organizationName: v.string(),

    orgNumber: v.optional(v.string()),

    billingEmail: v.string(),

  },

  returns: v.object({

    organizationId: v.id('organizations'),

  }),

  handler: async (ctx, args) => {

    const organizationName = args.organizationName.trim()

    const billingEmail = normalizeEmail(args.billingEmail)



    if (!organizationName) {

      throw new Error('Föreningsnamn krävs.')

    }

    if (!billingEmail.includes('@')) {

      throw new Error('Ogiltig faktura-e-post.')

    }



    const now = Date.now()

    const organizationId = await ctx.db.insert('organizations', {

      name: organizationName,

      orgNumber: args.orgNumber?.trim() || undefined,

      billingEmail,

      subscriptionStatus: 'trialing',

      trialEndsAt: now + trialDurationMs,

      createdAt: now,

    })



    await ctx.db.insert('organizationMembers', {

      organizationId,

      email: normalizeEmail(ctx.user.email),

      tokenIdentifier: ctx.user.tokenIdentifier,

      role: 'owner',

      createdAt: now,

    })



    return { organizationId }

  },

})



export const setSubscriptionStatus = internalMutation({

  args: {

    organizationId: v.id('organizations'),

    subscriptionStatus: subscriptionStatusValidator,

    trialEndsAt: v.optional(v.number()),

    stripeCustomerId: v.optional(v.string()),

    stripeSubscriptionId: v.optional(v.string()),

  },

  returns: v.null(),

  handler: async (ctx, args) => {

    const patch: {

      subscriptionStatus: typeof args.subscriptionStatus

      trialEndsAt?: number

      stripeCustomerId?: string

      stripeSubscriptionId?: string

    } = {

      subscriptionStatus: args.subscriptionStatus,

    }



    if (args.trialEndsAt !== undefined) {

      patch.trialEndsAt = args.trialEndsAt

    }

    if (args.stripeCustomerId !== undefined) {

      patch.stripeCustomerId = args.stripeCustomerId

    }

    if (args.stripeSubscriptionId !== undefined) {

      patch.stripeSubscriptionId = args.stripeSubscriptionId

    }



    await ctx.db.patch('organizations', args.organizationId, patch)

    return null

  },

})



export const expireTrials = internalMutation({

  args: {},

  returns: v.null(),

  handler: async (ctx) => {

    const now = Date.now()

    const organizations = await ctx.db.query('organizations').collect()



    for (const organization of organizations) {

      if (organization.subscriptionStatus !== 'trialing') {

        continue

      }

      if (

        organization.trialEndsAt !== undefined &&

        organization.trialEndsAt < now &&

        !organization.stripeSubscriptionId

      ) {

        await ctx.db.patch('organizations', organization._id, {

          subscriptionStatus: 'inactive',

        })

      }

    }



    return null

  },

})



export const canAccessShop = authedQuery({

  args: { shopId: v.id('shops') },

  returns: v.object({

    canAccess: v.boolean(),

    shop: v.union(shopSummaryValidator, v.null()),

    organization: v.union(

      v.object({

        _id: v.id('organizations'),

        name: v.string(),

        subscriptionStatus: subscriptionStatusValidator,

      }),

      v.null(),

    ),

  }),

  handler: async (ctx, args) => {

    const shop = await ctx.db.get('shops', args.shopId)

    if (!shop) {

      return { canAccess: false, shop: null, organization: null }

    }



    const membership = await ctx.db

      .query('organizationMembers')

      .withIndex('by_organizationId_and_email', (q) =>

        q

          .eq('organizationId', shop.organizationId)

          .eq('email', normalizeEmail(ctx.user.email)),

      )

      .unique()



    const organization = await ctx.db.get('organizations', shop.organizationId)



    return {

      canAccess: Boolean(membership),

      shop,

      organization: organization

        ? {

            _id: organization._id,

            name: organization.name,

            subscriptionStatus: organization.subscriptionStatus,

          }

        : null,

    }

  },

})



export const isStripeConfigured = authedQuery({

  args: {},

  returns: v.object({

    configured: v.boolean(),

  }),

  handler: async () => {
    await Promise.resolve()
    return {

      configured: Boolean(

        process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID,

      ),

    }

  },

})

