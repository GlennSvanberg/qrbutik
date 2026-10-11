import type { Id } from '../_generated/dataModel'
import type { SubscriptionStatus } from './validators'

export type StripeOrganizationBilling = {
  _id: Id<'organizations'>
  stripeSubscriptionId?: string
  subscriptionStatus: SubscriptionStatus
  trialEndsAt?: number
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

export function assertCanStartSubscription(
  organization: StripeOrganizationBilling,
): void {
  if (
    organization.stripeSubscriptionId &&
    (organization.subscriptionStatus === 'active' ||
      organization.subscriptionStatus === 'trialing')
  ) {
    throw new Error('Föreningen har redan en aktiv prenumeration.')
  }
}

export function subscriptionTrialEnd(
  organization: StripeOrganizationBilling,
  nowMs: number = Date.now(),
): number | undefined {
  if (
    organization.subscriptionStatus !== 'trialing' ||
    organization.trialEndsAt === undefined
  ) {
    return undefined
  }

  const trialEndSeconds = Math.floor(organization.trialEndsAt / 1000)
  if (trialEndSeconds <= Math.floor(nowMs / 1000)) {
    return undefined
  }

  return trialEndSeconds
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
 * `subscription_data.default_tax_rates`, and to `subscriptions.create`
 * (including `send_invoice`) via top-level `default_tax_rates`. The Tax Rate
 * object itself is inclusive; this only attaches its ID.
 */
export function subscriptionDefaultTaxRates(taxRateId: string | undefined): {
  default_tax_rates?: Array<string>
} {
  if (!taxRateId) {
    return {}
  }

  return { default_tax_rates: [taxRateId] }
}

export type CheckoutSubscriptionData = {
  metadata: {
    organizationId: string
  }
  trial_end?: number
  default_tax_rates?: Array<string>
}

export function buildCheckoutSubscriptionData(input: {
  organizationId: string
  trialEnd: number | undefined
  taxRateId: string | undefined
}): CheckoutSubscriptionData {
  return {
    metadata: {
      organizationId: input.organizationId,
    },
    ...(input.trialEnd !== undefined ? { trial_end: input.trialEnd } : {}),
    ...subscriptionDefaultTaxRates(input.taxRateId),
  }
}

export type InvoiceSubscriptionCreateParams = {
  customer: string
  items: Array<{ price: string }>
  collection_method: 'send_invoice'
  days_until_due: number
  metadata: {
    organizationId: string
  }
  trial_end?: number
  default_tax_rates?: Array<string>
}

export function buildInvoiceSubscriptionParams(input: {
  customerId: string
  priceId: string
  organizationId: string
  trialEnd: number | undefined
  taxRateId: string | undefined
}): InvoiceSubscriptionCreateParams {
  return {
    customer: input.customerId,
    items: [{ price: input.priceId }],
    collection_method: 'send_invoice',
    days_until_due: INVOICE_DAYS_UNTIL_DUE,
    metadata: {
      organizationId: input.organizationId,
    },
    ...(input.trialEnd !== undefined ? { trial_end: input.trialEnd } : {}),
    ...subscriptionDefaultTaxRates(input.taxRateId),
  }
}
