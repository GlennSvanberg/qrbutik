import { describe, expect, it } from 'vitest'
import {
  canOpenCustomerPortal,
  canPurchaseEvent,
  canPurchaseSeason,
  effectivePlan,
  hasAccountingExport,
  hasSalesExport,
  needsPaymentUrgently,
} from './billingUi'
import type { BillingOrgState } from './billingUi'

const NOW = Date.UTC(2025, 5, 14, 12, 0, 0)

describe('effectivePlan', () => {
  it('defaults to Gratis', () => {
    expect(effectivePlan({ subscriptionStatus: 'inactive' }, NOW)).toBe('gratis')
  })

  it('treats a local leftover trial as Gratis', () => {
    expect(effectivePlan({ subscriptionStatus: 'trialing' }, NOW)).toBe('gratis')
  })

  it('keeps an active legacy subscription as Säsong-equivalent', () => {
    const org: BillingOrgState = {
      subscriptionStatus: 'active',
      stripeSubscriptionId: 'sub_legacy',
    }
    expect(effectivePlan(org, NOW)).toBe('season')
    expect(hasAccountingExport(org, NOW)).toBe(true)
  })

  it('keeps Event only until expiry', () => {
    const active: BillingOrgState = {
      subscriptionStatus: 'inactive',
      plan: 'event',
      eventExpiresAt: NOW + 60_000,
    }
    const expired: BillingOrgState = {
      ...active,
      eventExpiresAt: NOW - 1,
    }
    expect(effectivePlan(active, NOW)).toBe('event')
    expect(hasSalesExport(active, NOW)).toBe(true)
    expect(hasAccountingExport(active, NOW)).toBe(false)
    expect(effectivePlan(expired, NOW)).toBe('gratis')
  })
})

describe('checkout and portal', () => {
  it('allows Event and Säsong on Gratis when prices are configured', () => {
    const org: BillingOrgState = { subscriptionStatus: 'inactive', plan: 'gratis' }
    expect(canPurchaseEvent(org, true, NOW)).toBe(true)
    expect(canPurchaseSeason(org, true)).toBe(true)
    expect(canPurchaseEvent(org, false, NOW)).toBe(false)
  })

  it('blocks a second subscription over an active Säsong or legacy license', () => {
    const season: BillingOrgState = {
      subscriptionStatus: 'active',
      plan: 'season',
      stripeSubscriptionId: 'sub_season',
      stripeCustomerId: 'cus_1',
    }
    expect(canPurchaseSeason(season, true)).toBe(false)
    expect(canPurchaseEvent(season, true, NOW)).toBe(false)
    expect(canOpenCustomerPortal(season)).toBe(true)

    const legacy: BillingOrgState = {
      subscriptionStatus: 'trialing',
      stripeSubscriptionId: 'sub_legacy',
      stripeCustomerId: 'cus_legacy',
    }
    expect(canPurchaseSeason(legacy, true)).toBe(false)
    expect(canOpenCustomerPortal(legacy)).toBe(true)
  })

  it('opens the portal for Säsong and not for a one-time Event', () => {
    expect(
      canOpenCustomerPortal({
        subscriptionStatus: 'inactive',
        plan: 'event',
        stripeCustomerId: 'cus_event',
      }),
    ).toBe(false)
  })
})

describe('needsPaymentUrgently', () => {
  it('is true only for past_due', () => {
    expect(needsPaymentUrgently({ subscriptionStatus: 'past_due' })).toBe(true)
    expect(needsPaymentUrgently({ subscriptionStatus: 'inactive' })).toBe(false)
    expect(needsPaymentUrgently({ subscriptionStatus: 'active' })).toBe(false)
  })
})
