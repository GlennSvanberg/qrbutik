"use node";

import { v } from 'convex/values'
import { action } from './_generated/server'
import { internal } from './_generated/api'
import {
  buildCsvExport,
  buildExportFilename,
  buildSieExport,
} from './lib/exportFormat'

const exportResultValidator = v.object({
  filename: v.string(),
  content: v.string(),
  mimeType: v.string(),
})

export const exportTransactionsCsv = action({
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

    const data = await ctx.runQuery(internal.exports.listTransactionsForExportInternal, {
      organizationId: args.organizationId,
      callerEmail: identity.email.trim().toLowerCase(),
      shopId: args.shopId,
      start: args.start,
      end: args.end,
      includePending: args.includePending,
    })

    const content = buildCsvExport(data.rows)
    const filename = buildExportFilename({
      organizationName: data.organizationName,
      extension: 'csv',
      start: args.start,
      end: args.end,
    })

    return {
      filename,
      content,
      mimeType: 'text/csv;charset=utf-8',
    }
  },
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

    const data = await ctx.runQuery(internal.exports.listTransactionsForExportInternal, {
      organizationId: args.organizationId,
      callerEmail: identity.email.trim().toLowerCase(),
      shopId: args.shopId,
      start: args.start,
      end: args.end,
      includePending: args.includePending,
    })

    const revenueAccount = data.sieRevenueAccount?.trim() || '3010'
    const content = buildSieExport({
      organizationName: data.organizationName,
      orgNumber: data.orgNumber,
      revenueAccount,
      rows: data.rows,
    })

    const filename = buildExportFilename({
      organizationName: data.organizationName,
      extension: 'se',
      start: args.start,
      end: args.end,
    })

    return {
      filename,
      content,
      mimeType: 'text/plain;charset=utf-8',
    }
  },
})
