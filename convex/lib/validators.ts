import { v } from 'convex/values'

export const subscriptionStatusValidator = v.union(
  v.literal('trialing'),
  v.literal('active'),
  v.literal('past_due'),
  v.literal('canceled'),
  v.literal('inactive'),
)

export const orgRoleValidator = v.union(
  v.literal('owner'),
  v.literal('treasurer'),
  v.literal('editor'),
)

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'inactive'

export type OrgRole = 'owner' | 'treasurer' | 'editor'

export const ACTIVE_SUBSCRIPTION_STATUSES: ReadonlyArray<SubscriptionStatus> = [
  'trialing',
  'active',
]

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status)
}
