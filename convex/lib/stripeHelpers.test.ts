import { describe, expect, it } from 'vitest'
import {
  assertCanStartSubscription,
  buildCheckoutSubscriptionData,
  buildInvoiceSubscriptionParams,
  mapStripeSubscriptionStatus,
  optionalStripeTaxRateId,
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

describe('optionalStripeTaxRateId', () => {
  it('treats missing and blank values as unset', () => {
    expect(optionalStripeTaxRateId(undefined)).toBeUndefined()
    expect(optionalStripeTaxRateId('')).toBeUndefined()
    expect(optionalStripeTaxRateId('   ')).toBeUndefined()
  })

  it('returns a trimmed tax rate id', () => {
    expect(optionalStripeTaxRateId(' txr_se_moms ')).toBe('txr_se_moms')
  })
})

describe('buildCheckoutSubscriptionData', () => {
  it('omits default_tax_rates when STRIPE_TAX_RATE_ID is unset', () => {
    const data = buildCheckoutSubscriptionData({
      organizationId: orgId,
      trialEnd: 1_700_000_000,
      taxRateId: optionalStripeTaxRateId(undefined),
    })

    expect(data).toEqual({
      metadata: { organizationId: orgId },
      trial_end: 1_700_000_000,
    })
    expect(data).not.toHaveProperty('default_tax_rates')
  })

  it('sets subscription_data.default_tax_rates when STRIPE_TAX_RATE_ID is set', () => {
    const data = buildCheckoutSubscriptionData({
      organizationId: orgId,
      trialEnd: undefined,
      taxRateId: optionalStripeTaxRateId('txr_25'),
    })

    expect(data).toEqual({
      metadata: { organizationId: orgId },
      default_tax_rates: ['txr_25'],
    })
    expect(data).not.toHaveProperty('trial_end')
  })
})

describe('buildInvoiceSubscriptionParams', () => {
  const base = {
    customerId: 'cus_123',
    priceId: 'price_995',
    organizationId: orgId,
  }

  it('omits default_tax_rates when STRIPE_TAX_RATE_ID is unset', () => {
    const params = buildInvoiceSubscriptionParams({
      ...base,
      trialEnd: undefined,
      taxRateId: optionalStripeTaxRateId(''),
    })

    expect(params).toEqual({
      customer: 'cus_123',
      items: [{ price: 'price_995' }],
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: { organizationId: orgId },
    })
    expect(params).not.toHaveProperty('default_tax_rates')
    expect(params.items[0]).not.toHaveProperty('tax_rates')
  })

  it('sets default_tax_rates when STRIPE_TAX_RATE_ID is set', () => {
    const params = buildInvoiceSubscriptionParams({
      ...base,
      trialEnd: 1_700_000_000,
      taxRateId: optionalStripeTaxRateId(' txr_25 '),
    })

    expect(params).toEqual({
      customer: 'cus_123',
      items: [{ price: 'price_995' }],
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: { organizationId: orgId },
      trial_end: 1_700_000_000,
      default_tax_rates: ['txr_25'],
    })
    expect(params.items[0]).not.toHaveProperty('tax_rates')
  })
})
