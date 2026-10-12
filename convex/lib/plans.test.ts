import { describe, expect, it } from 'vitest'
import {
  ACCOUNTING_EXPORT_ERROR,
  EVENT_DURATION_MS,
  EVENT_PRICE_KR,
  KIOSK_LIMIT_ERROR,
  LEGACY_MONTHLY_LICENSE_KR,
  SEASON_MONTHLY_EQUIVALENT_KR,
  SEASON_PRICE_KR,
  assertCanBuyEvent,
  assertCanStartSeason,
  canAddAdmin,
  canOpenCustomerPortal,
  isEventExpiringSoon,
  isKioskWithinLimit,
  monthlyRecurringKr,
  resolveEntitlements,
} from './plans'

const NOW = Date.UTC(2026, 9, 12, 12, 0, 0)

describe('resolveEntitlements', () => {
  it('defaults missing plan data to Gratis', () => {
    const entitlements = resolveEntitlements(
      { subscriptionStatus: 'inactive' },
      NOW,
    )

    expect(entitlements.effectivePlan).toBe('gratis')
    expect(entitlements.maxKiosks).toBe(1)
    expect(entitlements.maxAdmins).toBe(1)
    expect(entitlements.showBranding).toBe(true)
    expect(entitlements.basicStats).toBe(true)
    expect(entitlements.salesReport).toBe(false)
    expect(entitlements.salesExport).toBe(false)
    expect(entitlements.accountingExport).toBe(false)
  })

  it('treats a local no-card trial as Gratis', () => {
    const entitlements = resolveEntitlements(
      { subscriptionStatus: 'trialing' },
      NOW,
    )
    expect(entitlements.effectivePlan).toBe('gratis')
    expect(entitlements.grandfathered).toBe(false)
  })

  it('keeps an active or trialing 995 subscription on Säsong-equivalent access', () => {
    for (const subscriptionStatus of ['active', 'trialing'] as const) {
      const entitlements = resolveEntitlements(
        {
          subscriptionStatus,
          stripeSubscriptionId: 'sub_legacy',
        },
        NOW,
      )
      expect(entitlements.effectivePlan).toBe('season')
      expect(entitlements.grandfathered).toBe(true)
      expect(entitlements.maxKiosks).toBeNull()
      expect(entitlements.accountingExport).toBe(true)
      expect(entitlements.showBranding).toBe(false)
    }
  })

  it('drops grandfather access when the old subscription is no longer active', () => {
    const entitlements = resolveEntitlements(
      {
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: 'sub_legacy',
      },
      NOW,
    )
    expect(entitlements.effectivePlan).toBe('gratis')
    expect(entitlements.grandfathered).toBe(false)
  })

  it('unlocks Event until the stored expiry', () => {
    const active = resolveEntitlements(
      {
        plan: 'event',
        eventExpiresAt: NOW + EVENT_DURATION_MS,
        subscriptionStatus: 'inactive',
      },
      NOW,
    )
    expect(active.effectivePlan).toBe('event')
    expect(active.maxKiosks).toBeNull()
    expect(active.maxAdmins).toBe(1)
    expect(active.showBranding).toBe(false)
    expect(active.salesReport).toBe(true)
    expect(active.salesExport).toBe(true)
    expect(active.accountingExport).toBe(false)

    const expired = resolveEntitlements(
      {
        plan: 'event',
        eventExpiresAt: NOW - 1,
        subscriptionStatus: 'inactive',
      },
      NOW,
    )
    expect(expired.effectivePlan).toBe('gratis')
    expect(expired.showBranding).toBe(true)
  })

  it('unlocks Säsong only while the subscription is active', () => {
    const active = resolveEntitlements(
      {
        plan: 'season',
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_season',
      },
      NOW,
    )
    expect(active.effectivePlan).toBe('season')
    expect(active.grandfathered).toBe(false)
    expect(active.maxAdmins).toBeNull()
    expect(active.accountingExport).toBe(true)

    const pastDue = resolveEntitlements(
      {
        plan: 'season',
        subscriptionStatus: 'past_due',
        stripeSubscriptionId: 'sub_season',
      },
      NOW,
    )
    expect(pastDue.effectivePlan).toBe('gratis')
  })

  it('does not let an Event purchase downgrade a grandfathered club', () => {
    const entitlements = resolveEntitlements(
      {
        plan: 'event',
        eventExpiresAt: NOW + 1000,
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_legacy',
      },
      NOW,
    )
    expect(entitlements.effectivePlan).toBe('season')
    expect(entitlements.grandfathered).toBe(true)
  })
})

describe('plan limits', () => {
  it('blocks a second kiosk and a second admin on Gratis', () => {
    const gratis = resolveEntitlements({ subscriptionStatus: 'inactive' }, NOW)
    expect(isKioskWithinLimit(gratis, 0)).toBe(true)
    expect(isKioskWithinLimit(gratis, 1)).toBe(false)
    expect(canAddAdmin(gratis, 1)).toBe(false)
    expect(KIOSK_LIMIT_ERROR).toMatch(/1 kiosk/)
    expect(ACCOUNTING_EXPORT_ERROR).toMatch(/Säsong/)
  })

  it('allows another admin only on Säsong', () => {
    const season = resolveEntitlements(
      { plan: 'season', subscriptionStatus: 'active' },
      NOW,
    )
    expect(canAddAdmin(season, 4)).toBe(true)
  })
})

describe('checkout guards', () => {
  it('blocks a second season subscription while one is active', () => {
    expect(() =>
      assertCanStartSeason({
        plan: 'season',
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_season',
      }),
    ).toThrow(/aktiv prenumeration/)
  })

  it('blocks season checkout over a grandfathered 995 subscription', () => {
    expect(() =>
      assertCanStartSeason({
        subscriptionStatus: 'trialing',
        stripeSubscriptionId: 'sub_legacy',
      }),
    ).toThrow(/aktiv prenumeration/)
  })

  it('allows season checkout after cancellation', () => {
    expect(() =>
      assertCanStartSeason({
        plan: 'gratis',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: 'sub_old',
      }),
    ).not.toThrow()
  })

  it('blocks an Event purchase when Säsong is already active', () => {
    expect(() =>
      assertCanBuyEvent(
        { plan: 'season', subscriptionStatus: 'active' },
        NOW,
      ),
    ).toThrow(/aktiv prenumeration/)
  })
})

describe('billing helpers', () => {
  it('counts MRR as 995 for a paying legacy club and 125 for Säsong', () => {
    expect(
      monthlyRecurringKr({
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_legacy',
      }),
    ).toBe(LEGACY_MONTHLY_LICENSE_KR)
    expect(
      monthlyRecurringKr({
        plan: 'season',
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'sub_season',
      }),
    ).toBe(SEASON_MONTHLY_EQUIVALENT_KR)
    expect(
      monthlyRecurringKr({
        subscriptionStatus: 'trialing',
        stripeSubscriptionId: 'sub_legacy',
      }),
    ).toBe(0)
  })

  it('flags an Event that ends within a week', () => {
    expect(
      isEventExpiringSoon(
        {
          plan: 'event',
          eventExpiresAt: NOW + 2 * 24 * 60 * 60 * 1000,
          subscriptionStatus: 'inactive',
        },
        NOW,
      ),
    ).toBe(true)
  })

  it('opens the customer portal for Säsong and legacy subscriptions', () => {
    expect(
      canOpenCustomerPortal({
        plan: 'season',
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
      }),
    ).toBe(true)
    expect(
      canOpenCustomerPortal({
        stripeCustomerId: 'cus_legacy',
        stripeSubscriptionId: 'sub_legacy',
      }),
    ).toBe(true)
    expect(
      canOpenCustomerPortal({
        plan: 'event',
        stripeCustomerId: 'cus_event',
      }),
    ).toBe(false)
  })

  it('publishes the VAT-inclusive prices', () => {
    expect(EVENT_PRICE_KR).toBe(295)
    expect(SEASON_PRICE_KR).toBe(1495)
    expect(SEASON_MONTHLY_EQUIVALENT_KR).toBe(125)
  })
})
