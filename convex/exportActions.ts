import { v } from 'convex/values'
import { action } from './_generated/server'
import { internal } from './_generated/api'
import { buildExportFilename, buildSieExport, encodePc8 } from './lib/exportFormat'

const exportResultValidator = v.object({
  filename: v.string(),
  content: v.string(),
  mimeType: v.string(),
  encoding: v.optional(v.literal('base64')),
})

export const exportTransactionsSie = action({
  args: {
    organizationId: v.id('organizations'),
    shopId: v.optional(v.id('shops')),
    start: v.number(),
    end: v.number(),
    includePending: v.optional(v.boolean()),
  },
  returns: exportResultValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity?.email) {
      throw new Error('Not authenticated')
    }

    await ctx.runMutation(internal.organizations.syncOrganizationPlan, {
      organizationId: args.organizationId,
    })

    const data = await ctx.runQuery(internal.exports.listTransactionsForExportInternal, {
      organizationId: args.organizationId,
      callerEmail: identity.email.trim().toLowerCase(),
      shopId: args.shopId,
      start: args.start,
      end: args.end,
      includePending: args.includePending,
      format: 'sie',
    })

    const revenueAccount = data.sieRevenueAccount?.trim() || '3010'
    const content = buildSieExport({
      organizationName: data.organizationName,
      orgNumber: data.orgNumber,
      revenueAccount,
      rows: data.rows,
      periodStart: args.start,
      periodEnd: args.end,
    })
    const pc8 = encodePc8(content)

    const filename = buildExportFilename({
      organizationName: data.organizationName,
      extension: 'se',
      start: args.start,
      end: args.end,
    })

    return {
      filename,
      content: Buffer.from(pc8).toString('base64'),
      mimeType: 'application/octet-stream',
      encoding: 'base64' as const,
    }
  },
})
