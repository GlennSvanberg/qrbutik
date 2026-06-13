import {  normalizeEmail } from './validators'
import type {OrgRole} from './validators';
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export type AuthUser = {
  email: string
  tokenIdentifier: string
}

type AuthCtx = QueryCtx | MutationCtx

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

  return { shop, membership }
}
