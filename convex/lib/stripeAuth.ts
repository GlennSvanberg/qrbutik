import { internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import type { OrgRole } from './validators'

export async function requireOrgMemberForAction(
  ctx: ActionCtx,
  organizationId: Id<'organizations'>,
  allowedRoles?: ReadonlyArray<OrgRole>,
): Promise<void> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity?.email) {
    throw new Error('Not authenticated')
  }

  const membership = await ctx.runQuery(
    internal.stripeQueries.getMembershipForUser,
    {
      organizationId,
      email: identity.email,
    },
  )

  if (!membership) {
    throw new Error('Unauthorized: not a member of this organization')
  }

  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new Error('Unauthorized: insufficient role')
  }
}
