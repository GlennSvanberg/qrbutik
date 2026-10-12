import type { OrgRole } from '../lib/validators'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'inactive'
  | 'canceled'

/** First kiosk stays open on Gratis for every leftover subscription status. */
export const SUBSCRIPTION_GATING: ReadonlyArray<{
  status: SubscriptionStatus
  canPurchase: boolean
}> = [
  { status: 'trialing', canPurchase: true },
  { status: 'active', canPurchase: true },
  { status: 'past_due', canPurchase: true },
  { status: 'inactive', canPurchase: true },
  { status: 'canceled', canPurchase: true },
]

export const ROLE_SHOP_ACCESS: ReadonlyArray<{
  role: OrgRole
  assigned: boolean
  canAccess: boolean
}> = [
  { role: 'owner', assigned: false, canAccess: true },
  { role: 'treasurer', assigned: false, canAccess: true },
  { role: 'editor', assigned: true, canAccess: true },
  { role: 'editor', assigned: false, canAccess: false },
]

export const TREASURER_ROLES: ReadonlyArray<{
  role: OrgRole
  isTreasurer: boolean
}> = [
  { role: 'owner', isTreasurer: true },
  { role: 'treasurer', isTreasurer: true },
  { role: 'editor', isTreasurer: false },
]
