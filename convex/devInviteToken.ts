import { v } from 'convex/values'
import { query } from './_generated/server'
import { isDevMagicLinkEnabled } from './devMagicLink'
import { normalizeEmail } from './lib/validators'

export const getDevInviteToken = query({
  args: { email: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      token: v.string(),
      organizationId: v.id('organizations'),
    }),
  ),
  handler: async (ctx, args) => {
    if (!isDevMagicLinkEnabled()) {
      return null
    }

    const email = normalizeEmail(args.email)
    const now = Date.now()
    const invitations = await ctx.db.query('organizationInvitations').collect()

    const pendingInvites = invitations
      .filter(
        (invite) =>
          invite.email === email &&
          invite.acceptedAt === undefined &&
          invite.expiresAt > now,
      )
      .sort((a, b) => b.createdAt - a.createdAt)

    if (pendingInvites.length === 0) {
      return null
    }

    const pending = pendingInvites[0]

    return {
      token: pending.token,
      organizationId: pending.organizationId,
    }
  },
})
