import { normalizeEmail } from './validators'
import type { OrgRole } from './validators'
import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

export type AuthUser = {
  email: string
  tokenIdentifier: string
}

export type DbReadCtx = Pick<QueryCtx, 'db'>

export type AuthCtx = DbReadCtx & Pick<QueryCtx, 'auth'>

const treasurerRoles: ReadonlyArray<OrgRole> = ['owner', 'treasurer']

export async function getCurrentUser(ctx: AuthCtx): Promise<AuthUser> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const email = identity.email?.trim().toLowerCase()
  if (!email) {
    throw new Error('Authenticated user has no email')
  }

  return {
    email,
    tokenIdentifier: identity.tokenIdentifier,
  }
}

export async function getMembershipByEmail(
  ctx: AuthCtx,
  organizationId: Id<'organizations'>,
  email: string,
): Promise<Doc<'organizationMembers'> | null> {
  return await ctx.db
    .query('organizationMembers')
    .withIndex('by_organizationId_and_email', (q) =>
      q.eq('organizationId', organizationId).eq('email', normalizeEmail(email)),
    )
    .unique()
}

export async function requireOrgMember(
  ctx: AuthCtx,
  organizationId: Id<'organizations'>,
  allowedRoles?: ReadonlyArray<OrgRole>,
): Promise<Doc<'organizationMembers'>> {
  const user = await getCurrentUser(ctx)
  const membership = await getMembershipByEmail(ctx, organizationId, user.email)

  if (!membership) {
    throw new Error('Unauthorized: not a member of this organization')
  }

  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new Error('Unauthorized: insufficient role')
  }

  return membership
}

export function canAccessShopForMember(
  membership: Doc<'organizationMembers'>,
  shopId: Id<'shops'>,
): boolean {
  if (treasurerRoles.includes(membership.role)) {
    return true
  }

  const assignedShopIds = membership.assignedShopIds ?? []
  return assignedShopIds.includes(shopId)
}

export async function getAccessibleShopIds(
  ctx: DbReadCtx,
  organizationId: Id<'organizations'>,
  membership: Doc<'organizationMembers'>,
): Promise<Array<Id<'shops'>>> {
  const shops = await ctx.db
    .query('shops')
    .withIndex('by_organizationId', (q) => q.eq('organizationId', organizationId))
    .collect()

  if (treasurerRoles.includes(membership.role)) {
    return shops.map((shop) => shop._id)
  }

  const assignedShopIds = membership.assignedShopIds ?? []
  if (assignedShopIds.length === 0) {
    throw new Error('Du har ingen kiosk tilldelad. Kontakta föreningens administratör.')
  }

  const orgShopIds = new Set(shops.map((shop) => shop._id))
  return assignedShopIds.filter((shopId) => orgShopIds.has(shopId))
}

export async function requireShopAccess(
  ctx: AuthCtx,
  shopId: Id<'shops'>,
  allowedRoles?: ReadonlyArray<OrgRole>,
): Promise<{ shop: Doc<'shops'>; membership: Doc<'organizationMembers'> }> {
  const shop = await ctx.db.get('shops', shopId)
  if (!shop) {
    throw new Error('Butiken hittades inte.')
  }

  const membership = await requireOrgMember(
    ctx,
    shop.organizationId,
    allowedRoles,
  )

  if (!canAccessShopForMember(membership, shopId)) {
    throw new Error('Unauthorized: no access to this kiosk')
  }

  return { shop, membership }
}

export async function requireShopIdsAccess(
  ctx: AuthCtx,
  shopIds: Array<Id<'shops'>>,
): Promise<void> {
  for (const shopId of shopIds) {
    await requireShopAccess(ctx, shopId)
  }
}

export function isTreasurerRole(role: OrgRole): boolean {
  return treasurerRoles.includes(role)
}
