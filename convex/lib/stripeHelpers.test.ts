import { describe, expect, it } from 'vitest'
import {
  assertCanStartSubscription,
  mapStripeSubscriptionStatus,
  subscriptionTrialEnd,
} from './stripeHelpers'
import type { Id } from '../_generated/dataModel'

const orgId = 'jd7abc123' as Id<'organizations'>

describe('mapStripeSubscriptionStatus', () => {
  it('maps known Stripe statuses', () => {
    expect(mapStripeSubscriptionStatus('active')).toBe('active')
    expect(mapStripeSubscriptionStatus('trialing')).toBe('trialing')
    expect(mapStripeSubscriptionStatus('past_due')).toBe('past_due')
    expect(mapStripeSubscriptionStatus('canceled')).toBe('canceled')
  })

  it('maps unknown statuses to inactive', () => {
    expect(mapStripeSubscriptionStatus('unpaid')).toBe('inactive')
    expect(mapStripeSubscriptionStatus('incomplete')).toBe('inactive')
  })
})

describe('assertCanStartSubscription', () => {
  it('allows checkout when no Stripe subscription exists', () => {
    expect(() =>
      assertCanStartSubscription({
        _id: orgId,
        subscriptionStatus: 'trialing',
      }),
    ).not.toThrow()
  })

  it('blocks duplicate active subscriptions', () => {
    expect(() =>
      assertCanStartSubscription({
        _id: orgId,
        stripeSubscriptionId: 'sub_123',
        subscriptionStatus: 'active',
      }),
    ).toThrow('Föreningen har redan en aktiv prenumeration.')
  })

  it('blocks duplicate trialing Stripe subscriptions', () => {
    expect(() =>
      assertCanStartSubscription({
        _id: orgId,
        stripeSubscriptionId: 'sub_123',
        subscriptionStatus: 'trialing',
      }),
    ).toThrow('Föreningen har redan en aktiv prenumeration.')
  })

  it('allows new checkout after cancellation', () => {
    expect(() =>
      assertCanStartSubscription({
        _id: orgId,
        stripeSubscriptionId: 'sub_old',
        subscriptionStatus: 'canceled',
      }),
    ).not.toThrow()
  })
})

describe('subscriptionTrialEnd', () => {
  const now = Date.UTC(2025, 5, 13, 12, 0, 0)

  it('returns unix seconds for future trial end', () => {
    const trialEndsAt = now + 7 * 24 * 60 * 60 * 1000
    expect(
      subscriptionTrialEnd(
        {
          _id: orgId,
          subscriptionStatus: 'trialing',
          trialEndsAt,
        },
        now,
      ),
    ).toBe(Math.floor(trialEndsAt / 1000))
  })

  it('returns undefined when trial already ended', () => {
    expect(
      subscriptionTrialEnd(
        {
          _id: orgId,
          subscriptionStatus: 'trialing',
          trialEndsAt: now - 1000,
        },
        now,
      ),
    ).toBeUndefined()
  })

  it('returns undefined when not trialing', () => {
    expect(
      subscriptionTrialEnd(
        {
          _id: orgId,
          subscriptionStatus: 'inactive',
          trialEndsAt: now + 86_400_000,
        },
        now,
      ),
    ).toBeUndefined()
  })
})
