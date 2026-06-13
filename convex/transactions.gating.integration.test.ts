/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api, internal } from './_generated/api'
import schema from './schema'
import { SUBSCRIPTION_GATING } from './test/matrices'
import {
  FIXTURE_NOW,
  seedOrganization,
  seedProduct,
  seedShop,
} from './test/fixtures'

describe('transactions.create subscription gating', () => {
  it.each(SUBSCRIPTION_GATING)(
    'status $status → canPurchase=$canPurchase',
    async ({ status, canPurchase }) => {
      const t = convexTest(schema, convexModules)
      const { organizationId } = await seedOrganization(t, { status })
      const { shopId } = await seedShop(t, organizationId)
      await seedProduct(t, shopId)

      const items = [{ name: 'Korv', price: 60, quantity: 1 }]

      if (canPurchase) {
        const transactionId = await t.mutation(api.transactions.create, {
          shopId,
          amount: 60,
          reference: 'QRB-GATE-TEST',
          items,
        })
        expect(transactionId).toBeDefined()
      } else {
        await expect(
          t.mutation(api.transactions.create, {
            shopId,
            amount: 60,
            reference: 'QRB-GATE-TEST',
            items,
          }),
        ).rejects.toThrow('Kiosken är inte aktiv just nu.')
      }
    },
  )
})

describe('expireTrials', () => {
  it('inactivates expired trial without Stripe subscription', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'trialing',
      trialEndsAt: FIXTURE_NOW - 24 * 60 * 60 * 1000,
    })

    await t.mutation(internal.organizations.expireTrials, {})

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('inactive')
    expect(org?.trialExpiredEmailSentAt).toBeDefined()
  })

  it('skips org with stripeSubscriptionId even if trial expired', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'trialing',
      trialEndsAt: FIXTURE_NOW - 24 * 60 * 60 * 1000,
      stripeSubscriptionId: 'sub_keep_trialing',
    })

    await t.mutation(internal.organizations.expireTrials, {})

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('trialing')
  })
})
