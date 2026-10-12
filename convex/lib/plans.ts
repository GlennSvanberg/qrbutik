import type { SubscriptionStatus } from './validators'

export const GRATIS_MAX_KIOSKS = 1
export const GRATIS_MAX_ADMINS = 1
export const EVENT_MAX_ADMINS = 1
export const EVENT_DURATION_MS = 7 * 24 * 60 * 60 * 1000
export const EVENT_PRICE_KR = 295
export const SEASON_PRICE_KR = 1495
/** 1 495 kr / 12 ≈ 125 kr per month, including VAT. */
export const SEASON_MONTHLY_EQUIVALENT_KR = 125
export const LEGACY_MONTHLY_LICENSE_KR = 995

export const KIOSK_LIMIT_ERROR =
  'Gratisplanen inkluderar 1 kiosk. Uppgradera till Event eller Säsong för fler kiosker.'
export const ADMIN_LIMIT_ERROR = 'Fler administratörer ingår i Säsong.'
export const SALES_REPORT_ERROR =
  'Försäljningsrapport ingår i Event och Säsong. Gratis visar statistik för idag.'
export const SALES_EXPORT_ERROR =
  'Försäljningsrapport och export ingår i Event och Säsong.'
export const ACCOUNTING_EXPORT_ERROR = 'Bokföringsexport ingår i Säsong.'
export const KIOSK_CLOSED_ERROR = 'Kiosken är inte aktiv just nu.'
export const ACTIVE_SUBSCRIPTION_ERROR =
  'Föreningen har redan en aktiv prenumeration.'

export type CommercialPlan = 'gratis' | 'event' | 'season'

export type PlanSnapshot = {
  plan?: CommercialPlan
  eventExpiresAt?: number
  stripeSubscriptionId?: string
  subscriptionStatus: SubscriptionStatus
}

export type PlanEntitlements = {
  effectivePlan: CommercialPlan
  grandfathered: boolean
  maxKiosks: number | null
  maxAdmins: number | null
  showBranding: boolean
  basicStats: true
  salesReport: boolean
  salesExport: boolean
  accountingExport: boolean
}

/**
 * An old 995 kr Stripe subscription (active or trialing) that was never
 * converted to the new Säsong price. New season checkouts set `plan` to
 * `season`, so they are not treated as legacy.
 */
export function isGrandfatheredLegacy(org: PlanSnapshot): boolean {
  if (!org.stripeSubscriptionId) {
    return false
  }
  if (org.plan === 'season') {
    return false
  }
  return (
    org.subscriptionStatus === 'active' || org.subscriptionStatus === 'trialing'
  )
}

export function isSeasonActive(org: PlanSnapshot): boolean {
  return org.plan === 'season' && org.subscriptionStatus === 'active'
}

export function isEventActive(org: PlanSnapshot, now: number): boolean {
  return (
    org.plan === 'event' &&
    org.eventExpiresAt !== undefined &&
    org.eventExpiresAt > now
  )
}

export function eventHasExpired(org: PlanSnapshot, now: number): boolean {
  return (
    org.plan === 'event' &&
    org.eventExpiresAt !== undefined &&
    org.eventExpiresAt <= now &&
    !isGrandfatheredLegacy(org) &&
    !isSeasonActive(org)
  )
}

export function resolveEntitlements(
  org: PlanSnapshot,
  now: number,
): PlanEntitlements {
  const grandfathered = isGrandfatheredLegacy(org)
  const season = isSeasonActive(org)
  const event = !grandfathered && !season && isEventActive(org, now)
  const effectivePlan: CommercialPlan =
    grandfathered || season ? 'season' : event ? 'event' : 'gratis'

  if (effectivePlan === 'season') {
    return {
      effectivePlan,
      grandfathered,
      maxKiosks: null,
      maxAdmins: null,
      showBranding: false,
      basicStats: true,
      salesReport: true,
      salesExport: true,
      accountingExport: true,
    }
  }

  if (effectivePlan === 'event') {
    return {
      effectivePlan,
      grandfathered: false,
      maxKiosks: null,
      maxAdmins: EVENT_MAX_ADMINS,
      showBranding: false,
      basicStats: true,
      salesReport: true,
      salesExport: true,
      accountingExport: false,
    }
  }

  return {
    effectivePlan: 'gratis',
    grandfathered: false,
    maxKiosks: GRATIS_MAX_KIOSKS,
    maxAdmins: GRATIS_MAX_ADMINS,
    showBranding: true,
    basicStats: true,
    salesReport: false,
    salesExport: false,
    accountingExport: false,
  }
}

/**
 * Entitlements from the stored plan. Event expiry is applied by a mutation
 * or cron that sets `plan` back to `gratis`, so queries stay deterministic.
 */
export function resolveStoredEntitlements(org: PlanSnapshot): PlanEntitlements {
  if (org.plan === 'event' && org.eventExpiresAt !== undefined) {
    return resolveEntitlements(org, org.eventExpiresAt - 1)
  }
  return resolveEntitlements(org, 0)
}

export function monthlyRecurringKr(org: PlanSnapshot): number {
  if (isGrandfatheredLegacy(org) && org.subscriptionStatus === 'active') {
    return LEGACY_MONTHLY_LICENSE_KR
  }
  if (isSeasonActive(org)) {
    return SEASON_MONTHLY_EQUIVALENT_KR
  }
  return 0
}

export function isEventExpiringSoon(
  org: PlanSnapshot,
  now: number,
  withinMs = 7 * 24 * 60 * 60 * 1000,
): boolean {
  return (
    isEventActive(org, now) &&
    org.eventExpiresAt !== undefined &&
    org.eventExpiresAt <= now + withinMs
  )
}

export function canAddAdmin(
  entitlements: PlanEntitlements,
  memberCount: number,
): boolean {
  if (entitlements.maxAdmins === null) {
    return true
  }
  return memberCount < entitlements.maxAdmins
}

export function isKioskWithinLimit(
  entitlements: PlanEntitlements,
  index: number,
): boolean {
  if (entitlements.maxKiosks === null) {
    return true
  }
  return index >= 0 && index < entitlements.maxKiosks
}

export function assertCanStartSeason(org: PlanSnapshot): void {
  if (
    isSeasonActive(org) ||
    (org.stripeSubscriptionId !== undefined &&
      (org.subscriptionStatus === 'active' ||
        org.subscriptionStatus === 'trialing') &&
      org.plan !== 'event')
  ) {
    throw new Error(ACTIVE_SUBSCRIPTION_ERROR)
  }
}

export function assertCanBuyEvent(org: PlanSnapshot, now: number): void {
  const entitlements = resolveEntitlements(org, now)
  if (entitlements.effectivePlan === 'season') {
    throw new Error(ACTIVE_SUBSCRIPTION_ERROR)
  }
}

export function canOpenCustomerPortal(org: {
  plan?: CommercialPlan
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}): boolean {
  if (!org.stripeCustomerId) {
    return false
  }
  if (org.plan === 'season') {
    return true
  }
  return Boolean(org.stripeSubscriptionId && org.plan !== 'event')
}

export function isBasicStatsFilter(filter: {
  kind: 'period' | 'range'
  period?: string
}): boolean {
  return filter.kind === 'period' && filter.period === 'today'
}
