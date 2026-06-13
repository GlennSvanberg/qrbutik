import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { isDevPlatformAdminBypassEnabled } from './lib/platformAdmin'
import {
  isE2eTestEmail,
  isE2eTestOrganization,
  isE2eTestShopSlug,
} from './lib/testData'
import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

async function deleteShopCascade(ctx: MutationCtx, shopId: Id<'shops'>) {
  const products = await ctx.db
    .query('products')
    .withIndex('by_shopId', (q) => q.eq('shopId', shopId))
    .collect()
  for (const product of products) {
    await ctx.db.delete('products', product._id)
  }

  const transactions = await ctx.db
    .query('transactions')
    .withIndex('by_shopId', (q) => q.eq('shopId', shopId))
    .collect()
  for (const transaction of transactions) {
    await ctx.db.delete('transactions', transaction._id)
  }

  await ctx.db.delete('shops', shopId)
}

async function deleteOrganizationCascade(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const shops = await ctx.db
    .query('shops')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organizationId))
    .collect()
  for (const shop of shops) {
    await deleteShopCascade(ctx, shop._id)
  }

  const members = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organizationId))
    .collect()
  for (const member of members) {
    await ctx.db.delete('organizationMembers', member._id)
  }

  const invitations = await ctx.db
    .query('organizationInvitations')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organizationId))
    .collect()
  for (const invitation of invitations) {
    await ctx.db.delete('organizationInvitations', invitation._id)
  }

  await ctx.db.delete('organizations', organizationId)
}

async function organizationHasE2eMember(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
): Promise<boolean> {
  const members = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organizationId))
    .collect()

  return members.some((member) => isE2eTestEmail(member.email))
}

async function shouldDeleteOrganization(
  ctx: MutationCtx,
  organization: {
    _id: Id<'organizations'>
    name: string
    billingEmail: string
  },
): Promise<boolean> {
  if (isE2eTestOrganization(organization)) {
    return true
  }

  if (await organizationHasE2eMember(ctx, organization._id)) {
    return true
  }

  const shops = await ctx.db
    .query('shops')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organization._id))
    .collect()

  if (shops.length === 0) {
    return false
  }

  return shops.every((shop) => isE2eTestShopSlug(shop.slug))
}

export const cleanupE2eData = internalMutation({
  args: {},
  returns: v.object({
    deletedOrganizations: v.number(),
    deletedShops: v.number(),
  }),
  handler: async (ctx) => {
    if (!isDevPlatformAdminBypassEnabled()) {
      throw new Error('E2E cleanup is only available when DEV_MAGIC_LINK=true.')
    }

    let deletedOrganizations = 0
    let deletedShops = 0

    const organizations = await ctx.db.query('organizations').collect()
    for (const organization of organizations) {
      if (!(await shouldDeleteOrganization(ctx, organization))) {
        continue
      }

      const shops = await ctx.db
        .query('shops')
        .withIndex('by_organizationId', (q) => q.eq('organizationId', organization._id))
        .collect()
      deletedShops += shops.length

      await deleteOrganizationCascade(ctx, organization._id)
      deletedOrganizations += 1
    }

    const remainingShops = await ctx.db.query('shops').collect()
    for (const shop of remainingShops) {
      if (!isE2eTestShopSlug(shop.slug)) {
        continue
      }

      await deleteShopCascade(ctx, shop._id)
      deletedShops += 1
    }

    if (deletedOrganizations > 0 || deletedShops > 0) {
      console.warn('Removed E2E test data', {
        deletedOrganizations,
        deletedShops,
      })
    }

    return { deletedOrganizations, deletedShops }
  },
})
