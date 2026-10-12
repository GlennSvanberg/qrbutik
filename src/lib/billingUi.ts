export type CommercialPlan = 'gratis' | 'event' | 'season'

export type BillingOrgState = {
  subscriptionStatus: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  plan?: CommercialPlan
  eventExpiresAt?: number
}

export function isGrandfatheredLegacy(org: BillingOrgState): boolean {
  if (!org.stripeSubscriptionId || org.plan === 'season') {
    return false
  }
  return (
    org.subscriptionStatus === 'active' || org.subscriptionStatus === 'trialing'
  )
}

export function isSeasonActive(org: BillingOrgState): boolean {
  return org.plan === 'season' && org.subscriptionStatus === 'active'
}

export function isEventActive(org: BillingOrgState, now: number): boolean {
  return (
    org.plan === 'event' &&
    org.eventExpiresAt !== undefined &&
    org.eventExpiresAt > now
  )
}

export function effectivePlan(
  org: BillingOrgState,
  now = Date.now(),
): CommercialPlan {
  if (isGrandfatheredLegacy(org) || isSeasonActive(org)) {
    return 'season'
  }
  if (isEventActive(org, now)) {
    return 'event'
  }
  return 'gratis'
}

export function hasSalesReport(org: BillingOrgState, now = Date.now()): boolean {
  const plan = effectivePlan(org, now)
  return plan === 'event' || plan === 'season'
}

export function hasSalesExport(org: BillingOrgState, now = Date.now()): boolean {
  return hasSalesReport(org, now)
}

export function hasAccountingExport(
  org: BillingOrgState,
  now = Date.now(),
): boolean {
  return effectivePlan(org, now) === 'season'
}

export function canPurchaseEvent(
  org: BillingOrgState,
  eventConfigured: boolean,
  now = Date.now(),
): boolean {
  return eventConfigured && effectivePlan(org, now) !== 'season'
}

export function canPurchaseSeason(
  org: BillingOrgState,
  seasonConfigured: boolean,
): boolean {
  if (!seasonConfigured) {
    return false
  }
  if (isSeasonActive(org)) {
    return false
  }
  if (
    org.stripeSubscriptionId &&
    (org.subscriptionStatus === 'active' ||
      org.subscriptionStatus === 'trialing') &&
    org.plan !== 'event'
  ) {
    return false
  }
  return true
}

export function canOpenCustomerPortal(org: BillingOrgState): boolean {
  if (!org.stripeCustomerId) {
    return false
  }
  if (org.plan === 'season') {
    return true
  }
  return Boolean(org.stripeSubscriptionId && org.plan !== 'event')
}

export function needsPaymentUrgently(org: BillingOrgState): boolean {
  return org.subscriptionStatus === 'past_due'
}

export function planLabel(plan: CommercialPlan): string {
  if (plan === 'event') {
    return 'Event'
  }
  if (plan === 'season') {
    return 'Säsong'
  }
  return 'Gratis'
}
