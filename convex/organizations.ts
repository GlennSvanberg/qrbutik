import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import { authedMutation, authedQuery, orgQuery } from './lib/customFunctions'
import { canAccessShopForMember, getAccessibleShopIds } from './lib/auth'
import { syncOrganizationBilling } from './lib/planAccess'
import { normalizeEmail, subscriptionStatusValidator } from './lib/validators'
import type { Doc } from './_generated/dataModel'
import type { OrgRole, SubscriptionStatus } from './lib/validators'

const commercialPlanValidator = v.union(
  v.literal('gratis'),
  v.literal('event'),
  v.literal('season'),
)

const organizationSummaryValidator = v.object({
  _id: v.id('organizations'),
  _creationTime: v.number(),
  name: v.string(),
  orgNumber: v.optional(v.string()),
  sieRevenueAccount: v.optional(v.string()),
  billingEmail: v.string(),
  stripeCustomerId: v.optional(v.string()),
  stripeSubscriptionId: v.optional(v.string()),
  subscriptionStatus: subscriptionStatusValidator,
  plan: v.optional(commercialPlanValidator),
  eventExpiresAt: v.optional(v.number()),
  trialEndsAt: v.optional(v.number()),
  trialWelcomeEmailSentAt: v.optional(v.number()),
  trialReminderEmailSentAt: v.optional(v.number()),
  trialExpiredEmailSentAt: v.optional(v.number()),
  subscriptionActivatedEmailSentAt: v.optional(v.number()),
  paymentFailedEmailSentAt: v.optional(v.number()),
  createdAt: v.number(),
  role: v.union(v.literal('owner'), v.literal('treasurer'), v.literal('editor')),
})

const shopSummaryValidator = v.object({
  _id: v.id('shops'),
  _creationTime: v.number(),
  organizationId: v.id('organizations'),
  name: v.string(),
  teamLabel: v.optional(v.string()),
  slug: v.string(),
  swishNumber: v.string(),
  createdEmailSentAt: v.optional(v.number()),
  createdAt: v.number(),
})

function toOrganizationSummary(
  organization: Doc<'organizations'>,
  role: OrgRole,
) {
  return {
    _id: organization._id,
    _creationTime: organization._creationTime,
    name: organization.name,
    orgNumber: organization.orgNumber,
    sieRevenueAccount: organization.sieRevenueAccount,
    billingEmail: organization.billingEmail,
    stripeCustomerId: organization.stripeCustomerId,
    stripeSubscriptionId: organization.stripeSubscriptionId,
    subscriptionStatus: organization.subscriptionStatus,
    plan: organization.plan,
    eventExpiresAt: organization.eventExpiresAt,
    trialEndsAt: organization.trialEndsAt,
    trialWelcomeEmailSentAt: organization.trialWelcomeEmailSentAt,
    trialReminderEmailSentAt: organization.trialReminderEmailSentAt,
    trialExpiredEmailSentAt: organization.trialExpiredEmailSentAt,
    subscriptionActivatedEmailSentAt: organization.subscriptionActivatedEmailSentAt,
    paymentFailedEmailSentAt: organization.paymentFailedEmailSentAt,
    createdAt: organization.createdAt,
    role,
  }
}

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
      organizations.push(toOrganizationSummary(organization, membership.role))
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

    return toOrganizationSummary(organization, ctx.membership.role)
  },
})

export const listOrganizationShops = orgQuery({
  args: { organizationId: v.id('organizations') },
  returns: v.array(shopSummaryValidator),
  handler: async (ctx, args) => {
    const shops = await ctx.db
      .query('shops')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .order('desc')
      .collect()

    const accessibleShopIds = await getAccessibleShopIds(
      ctx,
      args.organizationId,
      ctx.membership,
    )
    const accessibleSet = new Set(accessibleShopIds)
    return shops.filter((shop) => accessibleSet.has(shop._id))
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
      plan: 'gratis',
      subscriptionStatus: 'inactive',
      createdAt: now,
      welcomeEmailSentAt: now,
    })

    await ctx.db.insert('organizationMembers', {
      organizationId,
      email: normalizeEmail(ctx.user.email),
      tokenIdentifier: ctx.user.tokenIdentifier,
      role: 'owner',
      createdAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.email.sendOrganizationWelcomeEmail, {
      to: billingEmail,
      organizationName,
      organizationId,
    })

    await ctx.scheduler.runAfter(0, internal.platformEvents.recordInternal, {
      type: 'org_created',
      createdAt: now,
      organizationId,
      organizationName,
      actorEmail: normalizeEmail(ctx.user.email),
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
      subscriptionStatus: SubscriptionStatus
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

export const setCommercialPlan = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    plan: commercialPlanValidator,
    subscriptionStatus: v.optional(subscriptionStatusValidator),
    eventExpiresAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: {
      plan: 'gratis' | 'event' | 'season'
      subscriptionStatus?: SubscriptionStatus
      eventExpiresAt?: number
      stripeCustomerId?: string
      stripeSubscriptionId?: string
    } = {
      plan: args.plan,
    }
    if (args.subscriptionStatus !== undefined) {
      patch.subscriptionStatus = args.subscriptionStatus
    }
    if (args.eventExpiresAt !== undefined) {
      patch.eventExpiresAt = args.eventExpiresAt
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

export const syncOrganizationPlan = internalMutation({
  args: { organizationId: v.id('organizations') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      return null
    }
    await syncOrganizationBilling(ctx, organization)
    return null
  },
})

export const expireEventPlans = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const organizations = await ctx.db.query('organizations').collect()
    for (const organization of organizations) {
      await syncOrganizationBilling(ctx, organization)
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
      canAccess: membership ? canAccessShopForMember(membership, args.shopId) : false,
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
    event: v.boolean(),
    season: v.boolean(),
  }),
  handler: async () => {
    await Promise.resolve()
    const hasSecret = Boolean(process.env.STRIPE_SECRET_KEY)
    const event = Boolean(hasSecret && process.env.STRIPE_EVENT_PRICE_ID)
    const season = Boolean(hasSecret && process.env.STRIPE_SEASON_PRICE_ID)
    return {
      configured: event || season,
      event,
      season,
    }
  },
})
