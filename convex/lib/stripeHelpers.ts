import type { SubscriptionStatus } from './validators'

export type StripeOrganizationBilling = {
  stripeSubscriptionId?: string
  subscriptionStatus: SubscriptionStatus
  plan?: 'gratis' | 'event' | 'season'
}

export function mapStripeSubscriptionStatus(
  status: string,
): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return status
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    default:
      return 'inactive'
  }
}

export const INVOICE_DAYS_UNTIL_DUE = 30

/** Blank `STRIPE_TAX_RATE_ID` is unset, so callers omit tax rate fields. */
export function optionalStripeTaxRateId(
  raw: string | undefined,
): string | undefined {
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Stripe applies a fixed rate to recurring Checkout via
 * `subscription_data.default_tax_rates`. The Tax Rate object itself is
 * inclusive; this only attaches its ID.
 */
export function subscriptionDefaultTaxRates(taxRateId: string | undefined): {
  default_tax_rates?: Array<string>
} {
  if (!taxRateId) {
    return {}
  }

  return { default_tax_rates: [taxRateId] }
}

/** One-time Checkout (`mode=payment`) attaches the tax rate on the line item. */
export function paymentLineItemTaxRates(taxRateId: string | undefined): {
  tax_rates?: Array<string>
} {
  if (!taxRateId) {
    return {}
  }

  return { tax_rates: [taxRateId] }
}

export type CheckoutLineItem = {
  price: string
  quantity: number
  tax_rates?: Array<string>
}

export function buildEventCheckoutLineItem(input: {
  priceId: string
  taxRateId: string | undefined
}): CheckoutLineItem {
  return {
    price: input.priceId,
    quantity: 1,
    ...paymentLineItemTaxRates(input.taxRateId),
  }
}

export type SeasonSubscriptionData = {
  metadata: {
    organizationId: string
    plan: 'season'
  }
  default_tax_rates?: Array<string>
}

export function buildSeasonSubscriptionData(input: {
  organizationId: string
  taxRateId: string | undefined
}): SeasonSubscriptionData {
  return {
    metadata: {
      organizationId: input.organizationId,
      plan: 'season',
    },
    ...subscriptionDefaultTaxRates(input.taxRateId),
  }
}

export type CheckoutSessionBase = {
  allow_promotion_codes: true
  metadata: {
    organizationId: string
    plan: 'event' | 'season'
  }
}

export function buildEventCheckoutParams(input: {
  organizationId: string
  priceId: string
  taxRateId: string | undefined
}): CheckoutSessionBase & {
  mode: 'payment'
  line_items: Array<CheckoutLineItem>
} {
  return {
    mode: 'payment',
    allow_promotion_codes: true,
    line_items: [
      buildEventCheckoutLineItem({
        priceId: input.priceId,
        taxRateId: input.taxRateId,
      }),
    ],
    metadata: {
      organizationId: input.organizationId,
      plan: 'event',
    },
  }
}

export function buildSeasonCheckoutParams(input: {
  organizationId: string
  priceId: string
  taxRateId: string | undefined
}): CheckoutSessionBase & {
  mode: 'subscription'
  line_items: Array<{ price: string; quantity: number }>
  subscription_data: SeasonSubscriptionData
} {
  return {
    mode: 'subscription',
    allow_promotion_codes: true,
    line_items: [{ price: input.priceId, quantity: 1 }],
    metadata: {
      organizationId: input.organizationId,
      plan: 'season',
    },
    subscription_data: buildSeasonSubscriptionData({
      organizationId: input.organizationId,
      taxRateId: input.taxRateId,
    }),
  }
}
