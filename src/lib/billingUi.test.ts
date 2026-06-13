import { describe, expect, it } from 'vitest'
import {
  
  canActivate,
  hasPaidSubscription,
  needsPaymentUrgently
} from './billingUi'
import type {BillingOrgState} from './billingUi';

const NOW = Date.UTC(2025, 5, 14, 12, 0, 0)

describe('hasPaidSubscription', () => {
  it.each([
    [{ subscriptionStatus: 'active', stripeSubscriptionId: 'sub_1' }, true],
    [{ subscriptionStatus: 'active' }, false],
    [{ subscriptionStatus: 'trialing', stripeSubscriptionId: 'sub_1' }, false],
    [{ subscriptionStatus: 'past_due', stripeSubscriptionId: 'sub_1' }, false],
  ] satisfies Array<[BillingOrgState, boolean]>)(
    'status=$subscriptionStatus sub=$stripeSubscriptionId → $expected',
    (org, expected) => {
      expect(hasPaidSubscription(org)).toBe(expected)
    },
  )
})

describe('canActivate', () => {
  it.each([
    [
      { subscriptionStatus: 'trialing' },
      true,
      true,
    ],
    [
      { subscriptionStatus: 'trialing' },
      false,
      false,
    ],
    [
      { subscriptionStatus: 'active', stripeSubscriptionId: 'sub_1' },
      true,
      false,
    ],
    [
      { subscriptionStatus: 'trialing', stripeSubscriptionId: 'sub_draft' },
      true,
      false,
    ],
    [
      { subscriptionStatus: 'canceled' },
      true,
      false,
    ],
    [
      { subscriptionStatus: 'inactive' },
      true,
      true,
    ],
  ] satisfies Array<[BillingOrgState, boolean, boolean]>)(
    'org=%j stripeConfigured=%s → %s',
    (org, stripeConfigured, expected) => {
      expect(canActivate(org, stripeConfigured)).toBe(expected)
    },
  )
})

describe('needsPaymentUrgently', () => {
  it.each([
    [{ subscriptionStatus: 'past_due' }, true],
    [
      {
        subscriptionStatus: 'inactive',
        trialEndsAt: NOW - 60_000,
      },
      true,
    ],
    [
      {
        subscriptionStatus: 'inactive',
        trialEndsAt: NOW + 60_000,
      },
      false,
    ],
    [{ subscriptionStatus: 'inactive' }, false],
    [{ subscriptionStatus: 'trialing', trialEndsAt: NOW - 60_000 }, false],
    [{ subscriptionStatus: 'active', stripeSubscriptionId: 'sub_1' }, false],
  ] satisfies Array<[BillingOrgState, boolean]>)(
    'org=%j → %s',
    (org, expected) => {
      expect(needsPaymentUrgently(org, NOW)).toBe(expected)
    },
  )
})
