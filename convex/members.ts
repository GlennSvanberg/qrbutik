import { v } from 'convex/values'
import { internal } from './_generated/api'
import {
  authedMutation,
  authedQuery,
  orgQuery,
  orgRoleMutation,
  requireTreasurerMembership,
} from './lib/customFunctions'
import { getCurrentUser, getMembershipByEmail } from './lib/auth'
import { normalizeEmail } from './lib/validators'
import type { Doc } from './_generated/dataModel'

type MemberDoc = Doc<'organizationMembers'>
type InvitationDoc = Doc<'organizationInvitations'>

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

function generateInviteToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const memberValidator = v.object({
  _id: v.id('organizationMembers'),
  email: v.string(),
  role: v.union(v.literal('owner'), v.literal('treasurer'), v.literal('editor')),
  assignedShopIds: v.optional(v.array(v.id('shops'))),
  createdAt: v.number(),
})

const invitationValidator = v.object({
  _id: v.id('organizationInvitations'),
  email: v.string(),
  role: v.union(v.literal('treasurer'), v.literal('editor')),
  assignedShopIds: v.optional(v.array(v.id('shops'))),
  expiresAt: v.number(),
  invitedByEmail: v.string(),
  createdAt: v.number(),
})

const orgTreasurerMutation = orgRoleMutation(['owner', 'treasurer'])

export const listOrganizationMembers = orgQuery({
  args: { organizationId: v.id('organizations') },
  returns: v.array(memberValidator),
  handler: async (ctx, args) => {
    requireTreasurerMembership(ctx.membership)

    const members = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()

    return members.map((member: MemberDoc) => ({
      _id: member._id,
      email: member.email,
      role: member.role,
      assignedShopIds: member.assignedShopIds,
      createdAt: member.createdAt,
    }))
  },
})

export const listPendingInvitations = orgQuery({
  args: { organizationId: v.id('organizations') },
  returns: v.array(invitationValidator),
  handler: async (ctx, args) => {
    requireTreasurerMembership(ctx.membership)

    const now = Date.now()
    const invitations = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()

    return invitations
      .filter((invite: InvitationDoc) => invite.acceptedAt === undefined && invite.expiresAt > now)
      .map((invite: InvitationDoc) => ({
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        assignedShopIds: invite.assignedShopIds,
        expiresAt: invite.expiresAt,
        invitedByEmail: invite.invitedByEmail,
        createdAt: invite.createdAt,
      }))
  },
})

export const inviteMember = orgTreasurerMutation({
  args: {
    organizationId: v.id('organizations'),
    email: v.string(),
    role: v.union(v.literal('treasurer'), v.literal('editor')),
    assignedShopIds: v.optional(v.array(v.id('shops'))),
  },
  returns: v.object({ invitationId: v.id('organizationInvitations') }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    if (!email.includes('@')) {
      throw new Error('Ogiltig e-postadress.')
    }

    if (args.role === 'editor') {
      if (!args.assignedShopIds || args.assignedShopIds.length === 0) {
        throw new Error('Välj minst en kiosk för lagledare.')
      }
    }

    const existingMember = await getMembershipByEmail(
      ctx,
      args.organizationId,
      email,
    )
    if (existingMember) {
      throw new Error('Personen är redan medlem i föreningen.')
    }

    const existingInvite = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_organizationId_and_email', (q) =>
        q.eq('organizationId', args.organizationId).eq('email', email),
      )
      .unique()

    if (existingInvite && existingInvite.acceptedAt === undefined) {
      await ctx.db.delete('organizationInvitations', existingInvite._id)
    }

    const organization = await ctx.db.get('organizations', args.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const now = Date.now()
    const token = generateInviteToken()

    const user = await getCurrentUser(ctx)

    const invitationId = await ctx.db.insert('organizationInvitations', {
      organizationId: args.organizationId,
      email,
      role: args.role,
      assignedShopIds: args.assignedShopIds,
      token,
      expiresAt: now + INVITE_EXPIRY_MS,
      invitedByEmail: user.email,
      createdAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.email.sendMemberInvitationEmail, {
      to: email,
      organizationName: organization.name,
      invitedByEmail: user.email,
      role: args.role,
      token,
    })

    return { invitationId }
  },
})

export const revokeInvitation = orgTreasurerMutation({
  args: {
    organizationId: v.id('organizations'),
    invitationId: v.id('organizationInvitations'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get('organizationInvitations', args.invitationId)
    if (!invitation || invitation.organizationId !== args.organizationId) {
      throw new Error('Inbjudan hittades inte.')
    }
    await ctx.db.delete('organizationInvitations', args.invitationId)
    return null
  },
})

export const acceptInvitation = authedMutation({
  args: { token: v.string() },
  returns: v.object({
    organizationId: v.id('organizations'),
    organizationName: v.string(),
  }),
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()

    if (!invitation || invitation.acceptedAt !== undefined) {
      throw new Error('Inbjudan är ogiltig eller redan accepterad.')
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error('Inbjudan har gått ut.')
    }

    if (normalizeEmail(ctx.user.email) !== invitation.email) {
      throw new Error('Inbjudan gäller en annan e-postadress.')
    }

    const existingMember = await getMembershipByEmail(
      ctx,
      invitation.organizationId,
      ctx.user.email,
    )
    if (existingMember) {
      throw new Error('Du är redan medlem i den här föreningen.')
    }

    const organization = await ctx.db.get('organizations', invitation.organizationId)
    if (!organization) {
      throw new Error('Föreningen hittades inte.')
    }

    const now = Date.now()
    await ctx.db.insert('organizationMembers', {
      organizationId: invitation.organizationId,
      email: normalizeEmail(ctx.user.email),
      tokenIdentifier: ctx.user.tokenIdentifier,
      role: invitation.role,
      assignedShopIds: invitation.assignedShopIds,
      createdAt: now,
    })

    await ctx.db.patch('organizationInvitations', invitation._id, {
      acceptedAt: now,
    })

    return {
      organizationId: invitation.organizationId,
      organizationName: organization.name,
    }
  },
})

export const syncMemberIdentity = authedMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const email = normalizeEmail(ctx.user.email)
    const memberships = await ctx.db
      .query('organizationMembers')
      .withIndex('by_email', (q) => q.eq('email', email))
      .collect()

    for (const membership of memberships) {
      if (membership.tokenIdentifier !== ctx.user.tokenIdentifier) {
        await ctx.db.patch('organizationMembers', membership._id, {
          tokenIdentifier: ctx.user.tokenIdentifier,
        })
      }
    }

    return null
  },
})

export const updateMemberRole = orgTreasurerMutation({
  args: {
    organizationId: v.id('organizations'),
    memberId: v.id('organizationMembers'),
    role: v.union(v.literal('treasurer'), v.literal('editor')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db.get('organizationMembers', args.memberId)
    if (!member || member.organizationId !== args.organizationId) {
      throw new Error('Medlemmen hittades inte.')
    }
    if (member.role === 'owner') {
      throw new Error('Ägarens roll kan inte ändras här.')
    }
    await ctx.db.patch('organizationMembers', args.memberId, { role: args.role })
    return null
  },
})

export const removeMember = orgTreasurerMutation({
  args: {
    organizationId: v.id('organizations'),
    memberId: v.id('organizationMembers'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db.get('organizationMembers', args.memberId)
    if (!member || member.organizationId !== args.organizationId) {
      throw new Error('Medlemmen hittades inte.')
    }
    if (member.role === 'owner') {
      const owners = await ctx.db
        .query('organizationMembers')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', args.organizationId),
        )
        .collect()
      const ownerCount = owners.filter((item) => item.role === 'owner').length
      if (ownerCount <= 1) {
        throw new Error('Föreningen måste ha minst en ägare.')
      }
    }
    await ctx.db.delete('organizationMembers', args.memberId)
    return null
  },
})

export const setMemberShopAssignments = orgTreasurerMutation({
  args: {
    organizationId: v.id('organizations'),
    memberId: v.id('organizationMembers'),
    assignedShopIds: v.array(v.id('shops')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db.get('organizationMembers', args.memberId)
    if (!member || member.organizationId !== args.organizationId) {
      throw new Error('Medlemmen hittades inte.')
    }
    if (member.role !== 'editor') {
      throw new Error('Kiosk-tilldelning gäller endast lagledare.')
    }
    if (args.assignedShopIds.length === 0) {
      throw new Error('Välj minst en kiosk.')
    }

    const orgShops = await ctx.db
      .query('shops')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()
    const orgShopIds = new Set(orgShops.map((shop) => shop._id))
    for (const shopId of args.assignedShopIds) {
      if (!orgShopIds.has(shopId)) {
        throw new Error('Ogiltig kiosk för den här föreningen.')
      }
    }

    await ctx.db.patch('organizationMembers', args.memberId, {
      assignedShopIds: args.assignedShopIds,
    })
    return null
  },
})

export const getInvitationByToken = authedQuery({
  args: { token: v.string() },
  returns: v.union(
    v.object({
      organizationName: v.string(),
      email: v.string(),
      role: v.union(v.literal('treasurer'), v.literal('editor')),
      expired: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()

    if (!invitation || invitation.acceptedAt !== undefined) {
      return null
    }

    const organization = await ctx.db.get('organizations', invitation.organizationId)
    if (!organization) {
      return null
    }

    return {
      organizationName: organization.name,
      email: invitation.email,
      role: invitation.role,
      expired: invitation.expiresAt < Date.now(),
    }
  },
})
