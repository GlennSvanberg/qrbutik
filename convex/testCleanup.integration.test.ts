/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { internal } from './_generated/api'
import schema from './schema'
import { FIXTURE_NOW } from './test/fixtures'

describe('testCleanup', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('removes E2E orgs and shops when dev magic link is enabled', async () => {
    vi.stubEnv('DEV_MAGIC_LINK', 'true')
    const t = convexTest(schema, convexModules)

    await t.run(async (ctx) => {
      const organizationId = await ctx.db.insert('organizations', {
        name: 'E2E Verify 123',
        billingEmail: 'e2e+kiosk-verify-123@qrbutik.test',
        subscriptionStatus: 'trialing',
        createdAt: FIXTURE_NOW,
      })
      const shopId = await ctx.db.insert('shops', {
        organizationId,
        name: 'Verifykiosk',
        slug: 'e2e-verify-123',
        swishNumber: '1234567890',
        createdAt: FIXTURE_NOW,
      })
      await ctx.db.insert('products', {
        shopId,
        name: 'Korv',
        price: 25,
        createdAt: FIXTURE_NOW,
      })
      await ctx.db.insert('transactions', {
        shopId,
        amount: 25,
        status: 'verified',
        reference: 'QRB-TEST',
        items: [{ name: 'Korv', price: 25, quantity: 1 }],
        createdAt: FIXTURE_NOW,
      })
      await ctx.db.insert('organizationMembers', {
        organizationId,
        email: 'e2e+kiosk-verify-123@qrbutik.test',
        role: 'owner',
        createdAt: FIXTURE_NOW,
      })

      const keepOrgId = await ctx.db.insert('organizations', {
        name: 'Glenn IK',
        billingEmail: 'glenn@example.com',
        subscriptionStatus: 'active',
        createdAt: FIXTURE_NOW,
      })
      await ctx.db.insert('shops', {
        organizationId: keepOrgId,
        name: 'Real kiosk',
        slug: 'test',
        swishNumber: '0735029113',
        createdAt: FIXTURE_NOW,
      })
    })

    const result = await t.mutation(internal.testCleanup.cleanupE2eData, {})
    expect(result).toEqual({ deletedOrganizations: 1, deletedShops: 1 })

    const remaining = await t.run(async (ctx) => {
      const organizations = await ctx.db.query('organizations').collect()
      const shops = await ctx.db.query('shops').collect()
      return { organizations, shops }
    })

    expect(remaining.organizations).toHaveLength(1)
    expect(remaining.organizations[0]?.name).toBe('Glenn IK')
    expect(remaining.shops).toHaveLength(1)
    expect(remaining.shops[0]?.slug).toBe('test')
  })

  it('refuses cleanup when dev magic link is disabled', async () => {
    vi.stubEnv('DEV_MAGIC_LINK', 'false')
    const t = convexTest(schema, convexModules)

    await expect(t.mutation(internal.testCleanup.cleanupE2eData, {})).rejects.toThrow(
      /DEV_MAGIC_LINK=true/,
    )
  })
})
