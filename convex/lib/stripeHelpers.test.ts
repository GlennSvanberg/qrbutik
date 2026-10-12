import { describe, expect, it } from 'vitest'
import {
  buildEventCheckoutLineItem,
  buildEventCheckoutParams,
  buildSeasonCheckoutParams,
  buildSeasonSubscriptionData,
  mapStripeSubscriptionStatus,
  optionalStripeTaxRateId,
} from './stripeHelpers'

const orgId = 'jd7abc123'

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

describe('buildEventCheckoutLineItem', () => {
  it('omits tax_rates when STRIPE_TAX_RATE_ID is unset', () => {
    const item = buildEventCheckoutLineItem({
      priceId: 'price_event',
      taxRateId: optionalStripeTaxRateId(undefined),
    })

    expect(item).toEqual({ price: 'price_event', quantity: 1 })
    expect(item).not.toHaveProperty('tax_rates')
  })

  it('sets tax_rates on the line item when STRIPE_TAX_RATE_ID is set', () => {
    const item = buildEventCheckoutLineItem({
      priceId: 'price_event',
      taxRateId: optionalStripeTaxRateId(' txr_25 '),
    })

    expect(item).toEqual({
      price: 'price_event',
      quantity: 1,
      tax_rates: ['txr_25'],
    })
  })
})

describe('buildSeasonSubscriptionData', () => {
  it('omits default_tax_rates when the tax rate is unset', () => {
    const data = buildSeasonSubscriptionData({
      organizationId: orgId,
      taxRateId: optionalStripeTaxRateId(''),
    })

    expect(data).toEqual({
      metadata: { organizationId: orgId, plan: 'season' },
    })
    expect(data).not.toHaveProperty('default_tax_rates')
    expect(data).not.toHaveProperty('trial_end')
  })

  it('sets default_tax_rates for the subscription', () => {
    const data = buildSeasonSubscriptionData({
      organizationId: orgId,
      taxRateId: optionalStripeTaxRateId('txr_25'),
    })

    expect(data).toEqual({
      metadata: { organizationId: orgId, plan: 'season' },
      default_tax_rates: ['txr_25'],
    })
  })
})

describe('checkout params', () => {
  it('builds a one-time payment checkout with promotion codes', () => {
    const params = buildEventCheckoutParams({
      organizationId: orgId,
      priceId: 'price_event',
      taxRateId: 'txr_25',
    })

    expect(params.mode).toBe('payment')
    expect(params.allow_promotion_codes).toBe(true)
    expect(params.metadata.plan).toBe('event')
    expect(params.line_items[0]).toEqual({
      price: 'price_event',
      quantity: 1,
      tax_rates: ['txr_25'],
    })
  })

  it('builds a season subscription checkout without a trial', () => {
    const params = buildSeasonCheckoutParams({
      organizationId: orgId,
      priceId: 'price_season',
      taxRateId: undefined,
    })

    expect(params.mode).toBe('subscription')
    expect(params.allow_promotion_codes).toBe(true)
    expect(params.metadata.plan).toBe('season')
    expect(params.line_items).toEqual([{ price: 'price_season', quantity: 1 }])
    expect(params.subscription_data).toEqual({
      metadata: { organizationId: orgId, plan: 'season' },
    })
    expect(params.subscription_data).not.toHaveProperty('trial_end')
    expect(params.line_items[0]).not.toHaveProperty('tax_rates')
  })
})
