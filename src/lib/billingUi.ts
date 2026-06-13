export type BillingOrgState = {
  subscriptionStatus: string
  stripeSubscriptionId?: string
  trialEndsAt?: number
}

export function hasPaidSubscription(org: BillingOrgState): boolean {
  return (
    org.subscriptionStatus === 'active' &&
    Boolean(org.stripeSubscriptionId)
  )
}

export function hasBillingSetup(org: BillingOrgState): boolean {
  return Boolean(org.stripeSubscriptionId)
}

export function canActivate(
  org: BillingOrgState,
  stripeConfigured: boolean,
): boolean {
  return (
    stripeConfigured &&
    !hasPaidSubscription(org) &&
    !hasBillingSetup(org) &&
    org.subscriptionStatus !== 'canceled'
  )
}

export function needsPaymentUrgently(
  org: BillingOrgState,
  now = Date.now(),
): boolean {
  return (
    org.subscriptionStatus === 'past_due' ||
    (org.subscriptionStatus === 'inactive' &&
      org.trialEndsAt !== undefined &&
      org.trialEndsAt < now)
  )
}
