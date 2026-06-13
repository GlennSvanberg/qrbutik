/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { internal } from './_generated/api'
import schema from './schema'
import {
  FIXTURE_NOW,
  seedOrganization,
} from './test/fixtures'

describe('stripeMutations', () => {
  it('recordStripeEvent deduplicates webhook events', async () => {
    const t = convexTest(schema, convexModules)

    const first = await t.mutation(internal.stripeMutations.recordStripeEvent, {
      eventId: 'evt_dedup_test',
      processedAt: FIXTURE_NOW,
    })
    expect(first).toBe(true)

    const second = await t.mutation(internal.stripeMutations.recordStripeEvent, {
      eventId: 'evt_dedup_test',
      processedAt: FIXTURE_NOW,
    })
    expect(second).toBe(false)
  })

  it('handleCheckoutCompleted sets org active and Stripe IDs', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, { status: 'trialing' })

    await t.mutation(internal.stripeMutations.handleCheckoutCompleted, {
      organizationId,
      stripeCustomerId: 'cus_test_1',
      stripeSubscriptionId: 'sub_test_1',
      subscriptionStatus: 'active',
    })

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('active')
    expect(org?.stripeCustomerId).toBe('cus_test_1')
    expect(org?.stripeSubscriptionId).toBe('sub_test_1')
    expect(org?.subscriptionActivatedEmailSentAt).toBeDefined()
  })

  it('handleCheckoutCompleted sends activation email only once', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, { status: 'trialing' })

    await t.mutation(internal.stripeMutations.handleCheckoutCompleted, {
      organizationId,
      stripeCustomerId: 'cus_test_2',
      stripeSubscriptionId: 'sub_test_2',
      subscriptionStatus: 'active',
    })

    await t.mutation(internal.stripeMutations.handleSubscriptionUpdated, {
      stripeCustomerId: 'cus_test_2',
      stripeSubscriptionId: 'sub_test_2',
      subscriptionStatus: 'active',
    })

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionActivatedEmailSentAt).toBeDefined()
  })

  it('handleSubscriptionUpdated maps canceled status', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'active',
      stripeCustomerId: 'cus_cancel_test',
      stripeSubscriptionId: 'sub_cancel_test',
    })

    await t.mutation(internal.stripeMutations.handleSubscriptionUpdated, {
      stripeCustomerId: 'cus_cancel_test',
      stripeSubscriptionId: 'sub_cancel_test',
      subscriptionStatus: 'canceled',
    })

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('canceled')
  })

  it('handlePaymentFailed sets past_due and records email timestamp', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'active',
      stripeCustomerId: 'cus_fail_test',
    })

    await t.mutation(internal.stripeMutations.handlePaymentFailed, {
      stripeCustomerId: 'cus_fail_test',
    })

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('past_due')
    expect(org?.paymentFailedEmailSentAt).toBeDefined()
  })

  it('handlePaymentFailed throttles email within 24h', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'active',
      stripeCustomerId: 'cus_throttle_test',
    })

    await t.run(async (ctx) => {
      await ctx.db.patch('organizations', organizationId, {
        paymentFailedEmailSentAt: Date.now() - 1000,
      })
    })

    await t.mutation(internal.stripeMutations.handlePaymentFailed, {
      stripeCustomerId: 'cus_throttle_test',
    })

    const org = await t.run(async (ctx) => ctx.db.get('organizations', organizationId))
    expect(org?.subscriptionStatus).toBe('past_due')
    expect(org?.paymentFailedEmailSentAt).toBeLessThan(Date.now() - 500)
  })
})
