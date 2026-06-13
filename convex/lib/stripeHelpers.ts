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
