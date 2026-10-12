import { internal } from '../_generated/api'
import {
  eventHasExpired,
  isKioskWithinLimit,
  resolveEntitlements,
  resolveStoredEntitlements,
} from './plans'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import type { PlanEntitlements } from './plans'

type ReadCtx = QueryCtx | MutationCtx

export async function shopsOldestFirst(
  ctx: ReadCtx,
  organizationId: Id<'organizations'>,
) {
  const shops = await ctx.db
    .query('shops')
    .withIndex('by_organizationId', (q) =>
      q.eq('organizationId', organizationId),
    )
    .collect()

  return shops.sort(
    (a, b) => a.createdAt - b.createdAt || a._creationTime - b._creationTime,
  )
}

export function storedEntitlements(
  organization: Doc<'organizations'>,
): PlanEntitlements {
  return resolveStoredEntitlements(organization)
}

export async function kioskIsOpen(
  ctx: ReadCtx,
  organization: Doc<'organizations'>,
  shopId: Id<'shops'>,
): Promise<boolean> {
  const entitlements = storedEntitlements(organization)
  if (entitlements.maxKiosks === null) {
    return true
  }
  const shops = await shopsOldestFirst(ctx, organization._id)
  const index = shops.findIndex((shop) => shop._id === shopId)
  return isKioskWithinLimit(entitlements, index)
}

/**
 * Reverts an expired Event purchase to Gratis and clears a local no-card
 * trial so it cannot be mistaken for a paid Stripe trial.
 */
export async function syncOrganizationBilling(
  ctx: MutationCtx,
  organization: Doc<'organizations'>,
): Promise<Doc<'organizations'>> {
  const now = Date.now()
  let current = organization

  if (eventHasExpired(current, now)) {
    const shouldEmail = current.eventExpiredEmailSentAt === undefined
    await ctx.db.patch('organizations', current._id, {
      plan: 'gratis',
      ...(shouldEmail ? { eventExpiredEmailSentAt: now } : {}),
    })
    if (shouldEmail) {
      await ctx.scheduler.runAfter(0, internal.email.sendEventExpiredEmail, {
        to: current.billingEmail,
        organizationName: current.name,
        organizationId: current._id,
      })
    }
    const updated = await ctx.db.get('organizations', current._id)
    if (!updated) {
      throw new Error('Föreningen hittades inte.')
    }
    current = updated
  }

  if (
    current.subscriptionStatus === 'trialing' &&
    current.stripeSubscriptionId === undefined
  ) {
    await ctx.db.patch('organizations', current._id, {
      subscriptionStatus: 'inactive',
      ...(current.plan === undefined ? { plan: 'gratis' } : {}),
    })
    const updated = await ctx.db.get('organizations', current._id)
    if (!updated) {
      throw new Error('Föreningen hittades inte.')
    }
    current = updated
  }

  return current
}

export function liveEntitlements(
  organization: Doc<'organizations'>,
  now = Date.now(),
): PlanEntitlements {
  return resolveEntitlements(organization, now)
}
