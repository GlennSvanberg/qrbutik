'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'
import { internal } from './_generated/api'
import { buildExcelExport } from './lib/buildExcelExport'
import { buildExportFilename } from './lib/exportFormat'

const exportResultValidator = v.object({
  filename: v.string(),
  content: v.string(),
  mimeType: v.string(),
  encoding: v.optional(v.literal('base64')),
})

export const exportTransactionsExcel = action({
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

    const data = await ctx.runQuery(
      internal.exports.listTransactionsForExportInternal,
      {
        organizationId: args.organizationId,
        callerEmail: identity.email.trim().toLowerCase(),
        shopId: args.shopId,
        start: args.start,
        end: args.end,
        includePending: args.includePending,
      },
    )

    const buffer = await buildExcelExport(data.rows)
    const filename = buildExportFilename({
      organizationName: data.organizationName,
      extension: 'xlsx',
      start: args.start,
      end: args.end,
    })

    return {
      filename,
      content: buffer.toString('base64'),
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      encoding: 'base64' as const,
    }
  },
})
