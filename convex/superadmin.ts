import { v } from 'convex/values'
import {
  estimatedMrrKr,
  isTrialExpiringSoon,
  needsPaymentUrgently,
} from './lib/billing'
import { authedQuery, platformAdminMutation, platformAdminQuery } from './lib/customFunctions'
import { requirePlatformAdmin } from './lib/platformAdmin'
import {
  isSubscriptionActive,
  subscriptionStatusValidator,
} from './lib/validators'
import type { SubscriptionStatus } from './lib/validators'
import type { Doc, Id } from './_generated/dataModel'
import type { DbReadCtx } from './lib/auth'
import { isE2eTestOrganization, isE2eTestShop } from './lib/testData'

const dayMs = 24 * 60 * 60 * 1000

const statusCountsValidator = v.object({
  trialing: v.number(),
  active: v.number(),
  past_due: v.number(),
  canceled: v.number(),
  inactive: v.number(),
})

const alertOrgValidator = v.object({
  organizationId: v.id('organizations'),
  name: v.string(),
  subscriptionStatus: subscriptionStatusValidator,
  trialEndsAt: v.union(v.number(), v.null()),
})

const recentOrgValidator = v.object({
  organizationId: v.id('organizations'),
  name: v.string(),
  subscriptionStatus: subscriptionStatusValidator,
  createdAt: v.number(),
})

const platformOverviewValidator = v.object({
  totalOrganizations: v.number(),
  totalShops: v.number(),
  totalMembers: v.number(),
  statusCounts: statusCountsValidator,
  estimatedMrrKr: v.number(),
  trialsExpiringSoon: v.array(alertOrgValidator),
  needsAttention: v.array(alertOrgValidator),
  recentOrganizations: v.array(recentOrgValidator),
  platformTransactionStats: v.object({
    verifiedCount7d: v.number(),
    verifiedRevenue7d: v.number(),
  }),
})

const organizationRowValidator = v.object({
  organizationId: v.id('organizations'),
  name: v.string(),
  billingEmail: v.string(),
  subscriptionStatus: subscriptionStatusValidator,
  trialEndsAt: v.union(v.number(), v.null()),
  stripeCustomerId: v.union(v.string(), v.null()),
  stripeSubscriptionId: v.union(v.string(), v.null()),
  createdAt: v.number(),
  shopCount: v.number(),
  memberCount: v.number(),
  ownerEmail: v.union(v.string(), v.null()),
  lastVerifiedSaleAt: v.union(v.number(), v.null()),
  licenseActive: v.boolean(),
})

const shopRowValidator = v.object({
  shopId: v.id('shops'),
  organizationId: v.id('organizations'),
  organizationName: v.string(),
  shopName: v.string(),
  teamLabel: v.union(v.string(), v.null()),
  slug: v.string(),
  swishNumber: v.string(),
  licenseActive: v.boolean(),
  verifiedTransactionCount7d: v.number(),
  lastVerifiedSaleAt: v.union(v.number(), v.null()),
})

function emptyStatusCounts(): Record<SubscriptionStatus, number> {
  return {
    trialing: 0,
    active: 0,
    past_due: 0,
    canceled: 0,
    inactive: 0,
  }
}

function buildShopTransactionStats(
  transactions: Array<Doc<'transactions'>>,
  rangeStart: number,
) {
  let verifiedTransactionCount7d = 0
  let lastVerifiedSaleAt: number | null = null

  for (const tx of transactions) {
    if (tx.status !== 'verified') {
      continue
    }

    if (lastVerifiedSaleAt === null || tx.createdAt > lastVerifiedSaleAt) {
      lastVerifiedSaleAt = tx.createdAt
    }

    if (tx.createdAt >= rangeStart) {
      verifiedTransactionCount7d += 1
    }
  }

  return { verifiedTransactionCount7d, lastVerifiedSaleAt }
}

async function getOwnerEmail(
  ctx: DbReadCtx,
  organizationId: Id<'organizations'>,
): Promise<string | null> {
  const members = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organizationId))
    .collect()

  const owner = members.find((member) => member.role === 'owner')
  if (owner) {
    return owner.email
  }
  return members[0]?.email ?? null
}

export const canAccess = authedQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    try {
      await requirePlatformAdmin(ctx)
      return true
    } catch {
      return false
    }
  },
})

export const getPlatformOverview = platformAdminQuery({
  args: {
    now: v.number(),
  },
  returns: platformOverviewValidator,
  handler: async (ctx, args) => {
    const allOrganizations = await ctx.db.query('organizations').collect()
    const organizations = allOrganizations.filter(
      (org) => !isE2eTestOrganization(org),
    )
    const e2eOrganizationIds = new Set(
      allOrganizations
        .filter((org) => isE2eTestOrganization(org))
        .map((org) => org._id),
    )
    const shops = (await ctx.db.query('shops').collect()).filter(
      (shop) => !isE2eTestShop(shop),
    )
    const members = (await ctx.db.query('organizationMembers').collect()).filter(
      (member) => !e2eOrganizationIds.has(member.organizationId),
    )

    const statusCounts = emptyStatusCounts()
    const trialsExpiringSoon: Array<{
      organizationId: Id<'organizations'>
      name: string
      subscriptionStatus: SubscriptionStatus
      trialEndsAt: number | null
    }> = []
    const needsAttention: Array<{
      organizationId: Id<'organizations'>
      name: string
      subscriptionStatus: SubscriptionStatus
      trialEndsAt: number | null
    }> = []

    for (const org of organizations) {
      statusCounts[org.subscriptionStatus] += 1

      const alertRow = {
        organizationId: org._id,
        name: org.name,
        subscriptionStatus: org.subscriptionStatus,
        trialEndsAt: org.trialEndsAt ?? null,
      }

      if (isTrialExpiringSoon(org.subscriptionStatus, org.trialEndsAt, args.now)) {
        trialsExpiringSoon.push(alertRow)
      }

      if (
        needsPaymentUrgently(org.subscriptionStatus, org.trialEndsAt, args.now)
      ) {
        needsAttention.push(alertRow)
      }
    }

    const rangeStart = args.now - 7 * dayMs
    let verifiedCount7d = 0
    let verifiedRevenue7d = 0

    for (const shop of shops) {
      const transactions = await ctx.db
        .query('transactions')
        .withIndex('by_shopId', (q) => q.eq('shopId', shop._id))
        .collect()

      for (const tx of transactions) {
        if (tx.status === 'verified' && tx.createdAt >= rangeStart) {
          verifiedCount7d += 1
          verifiedRevenue7d += tx.amount
        }
      }
    }

    const recentOrganizations = [...organizations]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((org) => ({
        organizationId: org._id,
        name: org.name,
        subscriptionStatus: org.subscriptionStatus,
        createdAt: org.createdAt,
      }))

    return {
      totalOrganizations: organizations.length,
      totalShops: shops.length,
      totalMembers: members.length,
      statusCounts,
      estimatedMrrKr: estimatedMrrKr(statusCounts.active),
      trialsExpiringSoon,
      needsAttention,
      recentOrganizations,
      platformTransactionStats: {
        verifiedCount7d,
        verifiedRevenue7d,
      },
    }
  },
})

export const listOrganizations = platformAdminQuery({
  args: {},
  returns: v.array(organizationRowValidator),
  handler: async (ctx) => {
    const organizations = (await ctx.db.query('organizations').collect()).filter(
      (org) => !isE2eTestOrganization(org),
    )
    const rows = []

    for (const org of organizations) {
      const shops = await ctx.db
        .query('shops')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', org._id))
        .collect()

      const members = await ctx.db
        .query('organizationMembers')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', org._id))
        .collect()

      let lastVerifiedSaleAt: number | null = null
      for (const shop of shops) {
        const transactions = await ctx.db
          .query('transactions')
          .withIndex('by_shopId', (q) => q.eq('shopId', shop._id))
          .collect()

        for (const tx of transactions) {
          if (tx.status !== 'verified') {
            continue
          }
          if (lastVerifiedSaleAt === null || tx.createdAt > lastVerifiedSaleAt) {
            lastVerifiedSaleAt = tx.createdAt
          }
        }
      }

      rows.push({
        organizationId: org._id,
        name: org.name,
        billingEmail: org.billingEmail,
        subscriptionStatus: org.subscriptionStatus,
        trialEndsAt: org.trialEndsAt ?? null,
        stripeCustomerId: org.stripeCustomerId ?? null,
        stripeSubscriptionId: org.stripeSubscriptionId ?? null,
        createdAt: org.createdAt,
        shopCount: shops.length,
        memberCount: members.length,
        ownerEmail: await getOwnerEmail(ctx, org._id),
        lastVerifiedSaleAt,
        licenseActive: isSubscriptionActive(org.subscriptionStatus),
      })
    }

    return rows.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const listAllShops = platformAdminQuery({
  args: {
    now: v.number(),
  },
  returns: v.array(shopRowValidator),
  handler: async (ctx, args) => {
    const shops = (await ctx.db.query('shops').collect()).filter(
      (shop) => !isE2eTestShop(shop),
    )
    const rangeStart = args.now - 7 * dayMs
    const rows = []

    for (const shop of shops) {
      const organization = await ctx.db.get('organizations', shop.organizationId)
      if (!organization) {
        continue
      }

      const transactions = await ctx.db
        .query('transactions')
        .withIndex('by_shopId', (q) => q.eq('shopId', shop._id))
        .collect()

      const stats = buildShopTransactionStats(transactions, rangeStart)

      rows.push({
        shopId: shop._id,
        organizationId: shop.organizationId,
        organizationName: organization.name,
        shopName: shop.name,
        teamLabel: shop.teamLabel ?? null,
        slug: shop.slug,
        swishNumber: shop.swishNumber,
        licenseActive: isSubscriptionActive(organization.subscriptionStatus),
        verifiedTransactionCount7d: stats.verifiedTransactionCount7d,
        lastVerifiedSaleAt: stats.lastVerifiedSaleAt,
      })
    }

    return rows.sort((a, b) =>
      a.organizationName.localeCompare(b.organizationName, 'sv-SE'),
    )
  },
})

export const extendTrial = platformAdminMutation({
  args: {
    organizationId: v.id('organizations'),
    additionalDays: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
  },
  returns: v.object({
    trialEndsAt: v.number(),
    subscriptionStatus: subscriptionStatusValidator,
  }),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    if (
      organization.subscriptionStatus !== 'trialing' &&
      organization.subscriptionStatus !== 'inactive'
    ) {
      throw new Error(
        'Provperiod kan bara förlängas för föreningar i provperiod eller inaktiv efter utgången trial.',
      )
    }

    let nextTrialEndsAt: number
    if (args.trialEndsAt !== undefined) {
      nextTrialEndsAt = args.trialEndsAt
    } else if (args.additionalDays !== undefined) {
      if (args.additionalDays < 1 || args.additionalDays > 90) {
        throw new Error('additionalDays måste vara mellan 1 och 90.')
      }
      const base =
        organization.trialEndsAt !== undefined && organization.trialEndsAt > Date.now()
          ? organization.trialEndsAt
          : Date.now()
      nextTrialEndsAt = base + args.additionalDays * dayMs
    } else {
      throw new Error('Ange additionalDays eller trialEndsAt.')
    }

    const nextStatus: SubscriptionStatus =
      organization.subscriptionStatus === 'inactive' ? 'trialing' : 'trialing'

    await ctx.db.patch('organizations', args.organizationId, {
      trialEndsAt: nextTrialEndsAt,
      subscriptionStatus: nextStatus,
    })

    console.warn('Platform admin extended trial', {
      adminEmail: ctx.user.email,
      organizationId: args.organizationId,
      trialEndsAt: nextTrialEndsAt,
      subscriptionStatus: nextStatus,
    })

    return {
      trialEndsAt: nextTrialEndsAt,
      subscriptionStatus: nextStatus,
    }
  },
})

export const updateSubscriptionStatus = platformAdminMutation({
  args: {
    organizationId: v.id('organizations'),
    subscriptionStatus: subscriptionStatusValidator,
    trialEndsAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const patch: {
      subscriptionStatus: SubscriptionStatus
      trialEndsAt?: number
    } = {
      subscriptionStatus: args.subscriptionStatus,
    }

    if (args.trialEndsAt !== undefined) {
      patch.trialEndsAt = args.trialEndsAt
    }

    await ctx.db.patch('organizations', args.organizationId, patch)

    console.warn('Platform admin updated subscription status', {
      adminEmail: ctx.user.email,
      organizationId: args.organizationId,
      previousStatus: organization.subscriptionStatus,
      nextStatus: args.subscriptionStatus,
      trialEndsAt: args.trialEndsAt,
    })

    return null
  },
})
