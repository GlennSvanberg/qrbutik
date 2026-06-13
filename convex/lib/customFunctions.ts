import {
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions'
import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { getCurrentUser, requireOrgMember } from './auth'
import type { OrgRole } from './validators'

export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    return { ctx: { ...ctx, user }, args }
  },
})

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    return { ctx: { ...ctx, user }, args }
  },
})

export const orgQuery = customQuery(authedQuery, {
  args: { organizationId: v.id('organizations') },
  input: async (ctx, args) => {
    const membership = await requireOrgMember(ctx, args.organizationId)
    return {
      ctx: { ...ctx, organizationId: args.organizationId, membership },
      args,
    }
  },
})

export const orgMutation = customMutation(authedMutation, {
  args: { organizationId: v.id('organizations') },
  input: async (ctx, args) => {
    const membership = await requireOrgMember(ctx, args.organizationId)
    return {
      ctx: { ...ctx, organizationId: args.organizationId, membership },
      args,
    }
  },
})

export function orgRoleMutation(allowedRoles: ReadonlyArray<OrgRole>) {
  return customMutation(authedMutation, {
    args: { organizationId: v.id('organizations') },
    input: async (ctx, args) => {
      const membership = await requireOrgMember(
        ctx,
        args.organizationId,
        allowedRoles,
      )
      return {
        ctx: { ...ctx, organizationId: args.organizationId, membership },
        args,
      }
    },
  })
}
