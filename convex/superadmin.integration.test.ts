/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api } from './_generated/api'
import schema from './schema'
import {
  FIXTURE_NOW,
  FIXTURE_TRIAL_ENDS_AT,
  asUser,
  seedOrganization,
  seedShop,
  seedTransaction,
} from './test/fixtures'

const PLATFORM_ADMIN = 'platform-admin@qrbutik.test'
const OTHER_USER = 'other@qrbutik.test'

describe('superadmin access', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('canAccess returns true for allowlisted email', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)

    const allowed = await asUser(t, PLATFORM_ADMIN).query(api.superadmin.canAccess, {})
    expect(allowed).toBe(true)
  })

  it('canAccess returns false for non-admin', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    vi.stubEnv('DEV_MAGIC_LINK', 'false')
    const t = convexTest(schema, convexModules)

    const allowed = await asUser(t, OTHER_USER).query(api.superadmin.canAccess, {})
    expect(allowed).toBe(false)
  })

  it('canAccess returns true for any authenticated user when dev magic link is enabled', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    vi.stubEnv('DEV_MAGIC_LINK', 'true')
    const t = convexTest(schema, convexModules)

    const allowed = await asUser(t, OTHER_USER).query(api.superadmin.canAccess, {})
    expect(allowed).toBe(true)
  })

  it('getPlatformOverview rejects non-admin', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    vi.stubEnv('DEV_MAGIC_LINK', 'false')
    const t = convexTest(schema, convexModules)
    await seedOrganization(t)

    await expect(
      asUser(t, OTHER_USER).query(api.superadmin.getPlatformOverview, {
        now: FIXTURE_NOW,
      }),
    ).rejects.toThrow(/platform admin access required/)
  })
})

describe('superadmin data', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns overview counts and org rows', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'active',
      stripeSubscriptionId: 'sub_test',
    })
    const { shopId } = await seedShop(t, organizationId)
    await seedTransaction(t, shopId, {
      createdAt: FIXTURE_NOW,
      amount: 100,
    })

    const overview = await asUser(t, PLATFORM_ADMIN).query(
      api.superadmin.getPlatformOverview,
      { now: FIXTURE_NOW },
    )

    expect(overview.totalOrganizations).toBe(1)
    expect(overview.totalShops).toBe(1)
    expect(overview.statusCounts.active).toBe(1)
    expect(overview.estimatedMrrKr).toBe(995)
    expect(overview.platformTransactionStats.verifiedCount7d).toBe(1)
    expect(overview.platformTransactionStats.verifiedRevenue7d).toBe(100)

    const orgs = await asUser(t, PLATFORM_ADMIN).query(
      api.superadmin.listOrganizations,
      {},
    )
    expect(orgs).toHaveLength(1)
    expect(orgs[0]?.organizationId).toBe(organizationId)
    expect(orgs[0]?.shopCount).toBe(1)

    const shops = await asUser(t, PLATFORM_ADMIN).query(api.superadmin.listAllShops, {
      now: FIXTURE_NOW,
    })
    expect(shops).toHaveLength(1)
    expect(shops[0]?.verifiedTransactionCount7d).toBe(1)
  })

  it('hides E2E test orgs and shops from platform views', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'active',
      stripeSubscriptionId: 'sub_real',
      name: 'Real IF',
      ownerEmail: 'real-owner@example.com',
    })
    await seedShop(t, organizationId, { slug: 'real-kiosk' })

    await t.run(async (ctx) => {
      const e2eOrgId = await ctx.db.insert('organizations', {
        name: 'E2E Verify 999',
        billingEmail: 'e2e+kiosk-verify-999@qrbutik.test',
        subscriptionStatus: 'trialing',
        createdAt: FIXTURE_NOW,
      })
      await ctx.db.insert('shops', {
        organizationId: e2eOrgId,
        name: 'Verifykiosk',
        slug: 'e2e-verify-999',
        swishNumber: '1234567890',
        createdAt: FIXTURE_NOW,
      })
    })

    const overview = await asUser(t, PLATFORM_ADMIN).query(
      api.superadmin.getPlatformOverview,
      { now: FIXTURE_NOW },
    )
    expect(overview.totalOrganizations).toBe(1)
    expect(overview.totalShops).toBe(1)

    const orgs = await asUser(t, PLATFORM_ADMIN).query(
      api.superadmin.listOrganizations,
      {},
    )
    expect(orgs).toHaveLength(1)
    expect(orgs[0]?.name).toBe('Real IF')

    const shops = await asUser(t, PLATFORM_ADMIN).query(api.superadmin.listAllShops, {
      now: FIXTURE_NOW,
    })
    expect(shops).toHaveLength(1)
    expect(shops[0]?.slug).toBe('real-kiosk')
  })
})

describe('superadmin mutations', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('extendTrial updates trialEndsAt for trialing org', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'trialing',
      trialEndsAt: FIXTURE_TRIAL_ENDS_AT,
    })

    const result = await asUser(t, PLATFORM_ADMIN).mutation(
      api.superadmin.extendTrial,
      {
        organizationId,
        additionalDays: 7,
      },
    )

    expect(result.subscriptionStatus).toBe('trialing')
    expect(result.trialEndsAt).toBeGreaterThan(FIXTURE_TRIAL_ENDS_AT)

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.trialEndsAt).toBe(result.trialEndsAt)
  })

  it('extendTrial reactivates inactive org to trialing', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'inactive',
      trialEndsAt: FIXTURE_NOW - 24 * 60 * 60 * 1000,
    })

    const result = await asUser(t, PLATFORM_ADMIN).mutation(
      api.superadmin.extendTrial,
      {
        organizationId,
        additionalDays: 14,
      },
    )

    expect(result.subscriptionStatus).toBe('trialing')
  })

  it('updateSubscriptionStatus rejects non-admin', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)

    await expect(
      asUser(t, OTHER_USER).mutation(api.superadmin.updateSubscriptionStatus, {
        organizationId,
        subscriptionStatus: 'active',
      }),
    ).rejects.toThrow(/platform admin access required/)
  })

  it('updateSubscriptionStatus patches organization', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, { status: 'trialing' })

    await asUser(t, PLATFORM_ADMIN).mutation(
      api.superadmin.updateSubscriptionStatus,
      {
        organizationId,
        subscriptionStatus: 'past_due',
      },
    )

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('past_due')
  })
})

describe('superadmin activity', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns activity summary excluding e2e events', async () => {
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', PLATFORM_ADMIN)
    const t = convexTest(schema, convexModules)
    const now = FIXTURE_NOW

    await t.run(async (ctx) => {
      await ctx.db.insert('platformEvents', {
        type: 'org_created',
        createdAt: now,
        organizationName: 'Glenn IK',
        actorEmail: 'owner@example.com',
      })
      await ctx.db.insert('platformEvents', {
        type: 'shop_view',
        createdAt: now,
        shopSlug: 'e2e-checkout-1',
        shopName: 'E2E Shop',
        visitorId: 'bot',
      })
      await ctx.db.insert('platformEvents', {
        type: 'checkout_started',
        createdAt: now,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        amountKr: 55,
      })
    })

    const summary = await asUser(t, PLATFORM_ADMIN).query(
      api.superadmin.getActivitySummary,
      { now },
    )

    expect(summary.orgsCreated).toBe(1)
    expect(summary.checkoutCount).toBe(1)
    expect(summary.checkoutRevenueKr).toBe(55)
    expect(summary.shopVisits).toEqual([])
  })
})
