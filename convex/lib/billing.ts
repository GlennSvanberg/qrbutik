import type { SubscriptionStatus } from './validators'

export const MONTHLY_LICENSE_KR = 995

export function estimatedMrrKr(activeOrgCount: number): number {
  return activeOrgCount * MONTHLY_LICENSE_KR
}

export function needsPaymentUrgently(
  status: SubscriptionStatus,
  trialEndsAt: number | undefined,
  now: number,
): boolean {
  return (
    status === 'past_due' ||
    (status === 'inactive' && trialEndsAt !== undefined && trialEndsAt < now)
  )
}

export function isTrialExpiringSoon(
  status: SubscriptionStatus,
  trialEndsAt: number | undefined,
  now: number,
  withinMs = 7 * 24 * 60 * 60 * 1000,
): boolean {
  return (
    status === 'trialing' &&
    trialEndsAt !== undefined &&
    trialEndsAt > now &&
    trialEndsAt <= now + withinMs
  )
}
