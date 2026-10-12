import { monthlyRecurringKr } from './plans'
import type { PlanSnapshot } from './plans'
import type { SubscriptionStatus } from './validators'

export const LEGACY_MONTHLY_LICENSE_KR = 995
export const SEASON_MONTHLY_EQUIVALENT_KR = 125

export function estimatedMrrKr(organizations: Array<PlanSnapshot>): number {
  return organizations.reduce(
    (sum, organization) => sum + monthlyRecurringKr(organization),
    0,
  )
}

export function needsPaymentUrgently(status: SubscriptionStatus): boolean {
  return status === 'past_due'
}
