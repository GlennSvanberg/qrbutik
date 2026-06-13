/// <reference types="vite/client" />
import { normalizeEmail } from '../lib/validators'
import type { TestConvex } from 'convex-test'
import type { Id } from '../_generated/dataModel'
import type schema from '../schema'
import type { SubscriptionStatus } from './matrices'

/** Fixed anchor for deterministic date assertions. */
export const FIXTURE_NOW = new Date('2025-06-14T12:00:00Z').getTime()

export const FIXTURE_TRIAL_ENDS_AT = FIXTURE_NOW + 14 * 24 * 60 * 60 * 1000

type ConvexTestInstance = TestConvex<typeof schema>

export type SeedOrgResult = {
  organizationId: Id<'organizations'>
  ownerEmail: string
}

export type SeedShopResult = {
  shopId: Id<'shops'>
  slug: string
}

export async function seedOrganization(
  t: ConvexTestInstance,
  options: {
    status?: SubscriptionStatus
    trialEndsAt?: number
    stripeSubscriptionId?: string
    stripeCustomerId?: string
    ownerEmail?: string
    name?: string
  } = {},
): Promise<SeedOrgResult> {
  const ownerEmail = normalizeEmail(
    options.ownerEmail ?? 'owner@qrbutik.test',
  )

  return await t.run(async (ctx) => {
    const organizationId = await ctx.db.insert('organizations', {
      name: options.name ?? 'Test IF',
      billingEmail: ownerEmail,
      subscriptionStatus: options.status ?? 'trialing',
      trialEndsAt: options.trialEndsAt ?? FIXTURE_TRIAL_ENDS_AT,
      stripeSubscriptionId: options.stripeSubscriptionId,
      stripeCustomerId: options.stripeCustomerId,
      createdAt: FIXTURE_NOW,
    })

    await ctx.db.insert('organizationMembers', {
      organizationId,
      email: ownerEmail,
      tokenIdentifier: `test|${ownerEmail}`,
      role: 'owner',
      createdAt: FIXTURE_NOW,
    })

    return { organizationId, ownerEmail }
  })
}

export async function seedShop(
  t: ConvexTestInstance,
  organizationId: Id<'organizations'>,
  options: { slug?: string; name?: string; swishNumber?: string } = {},
): Promise<SeedShopResult> {
  const slug = options.slug ?? 'test-kiosk'
  const shopId = await t.run(async (ctx) => {
    return await ctx.db.insert('shops', {
      organizationId,
      name: options.name ?? 'Testkiosk',
      slug,
      swishNumber: options.swishNumber ?? '1234567890',
      createdAt: FIXTURE_NOW,
    })
  })

  return { shopId, slug }
}

export async function seedProduct(
  t: ConvexTestInstance,
  shopId: Id<'shops'>,
  options: { name?: string; price?: number } = {},
): Promise<Id<'products'>> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('products', {
      shopId,
      name: options.name ?? 'Korv',
      price: options.price ?? 60,
      createdAt: FIXTURE_NOW,
    })
  })
}

export async function seedTransaction(
  t: ConvexTestInstance,
  shopId: Id<'shops'>,
  options: {
    status?: 'pending' | 'verified'
    createdAt?: number
    amount?: number
    reference?: string
  } = {},
): Promise<Id<'transactions'>> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('transactions', {
      shopId,
      amount: options.amount ?? 120,
      status: options.status ?? 'verified',
      reference: options.reference ?? 'QRB-TEST-001',
      items: [{ name: 'Korv', price: 60, quantity: 2 }],
      createdAt: options.createdAt ?? FIXTURE_NOW,
    })
  })
}

export async function seedMember(
  t: ConvexTestInstance,
  organizationId: Id<'organizations'>,
  options: {
    role: 'owner' | 'treasurer' | 'editor'
    email: string
    assignedShopIds?: Array<Id<'shops'>>
  },
): Promise<Id<'organizationMembers'>> {
  const email = normalizeEmail(options.email)

  return await t.run(async (ctx) => {
    return await ctx.db.insert('organizationMembers', {
      organizationId,
      email,
      tokenIdentifier: `test|${email}`,
      role: options.role,
      assignedShopIds: options.assignedShopIds,
      createdAt: FIXTURE_NOW,
    })
  })
}

export async function seedInvitation(
  t: ConvexTestInstance,
  organizationId: Id<'organizations'>,
  options: {
    email: string
    role: 'treasurer' | 'editor'
    token?: string
    expiresAt?: number
    assignedShopIds?: Array<Id<'shops'>>
    invitedByEmail?: string
  },
): Promise<{ invitationId: Id<'organizationInvitations'>; token: string }> {
  const email = normalizeEmail(options.email)
  const token = options.token ?? 'invite-token-test-abc123'

  const invitationId = await t.run(async (ctx) => {
    return await ctx.db.insert('organizationInvitations', {
      organizationId,
      email,
      role: options.role,
      assignedShopIds: options.assignedShopIds,
      token,
      expiresAt: options.expiresAt ?? Date.now() + 7 * 24 * 60 * 60 * 1000,
      invitedByEmail: options.invitedByEmail ?? 'owner@qrbutik.test',
      createdAt: FIXTURE_NOW,
    })
  })

  return { invitationId, token }
}

export function asUser(t: ConvexTestInstance, email: string) {
  const normalized = normalizeEmail(email)
  return t.withIdentity({
    name: normalized,
    email: normalized,
    tokenIdentifier: `test|${normalized}`,
  })
}
