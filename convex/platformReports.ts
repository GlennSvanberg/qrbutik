import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'
import { aggregateEventsForReport } from './lib/platformEvents'
import { canSendPlatformReportEmail } from './lib/platformReports'
import type { PlatformEventRow } from './lib/platformEvents'
import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

const hourMs = 60 * 60 * 1000

async function getOrCreateReportState(
  ctx: MutationCtx,
): Promise<{ _id: Id<'platformReportState'>; lastReportSentAt: number }> {
  const existing = await ctx.db.query('platformReportState').collect()
  if (existing[0]) {
    return existing[0]
  }

  const initialLastSent = Date.now() - hourMs
  const id = await ctx.db.insert('platformReportState', {
    lastReportSentAt: initialLastSent,
  })
  return { _id: id, lastReportSentAt: initialLastSent }
}

export const sendHourlyReport = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now()
    const state = await getOrCreateReportState(ctx)
    const windowStart = state.lastReportSentAt
    const windowEnd = now

    const allEvents = await ctx.db
      .query('platformEvents')
      .withIndex('by_createdAt', (q) => q.gte('createdAt', windowStart))
      .collect()

    const eventsInWindow = allEvents.filter(
      (event) => event.createdAt > windowStart && event.createdAt <= windowEnd,
    )

    if (eventsInWindow.length === 0) {
      await ctx.db.patch('platformReportState', state._id, {
        lastReportSentAt: windowEnd,
      })
      return null
    }

    const rows: Array<PlatformEventRow> = eventsInWindow.map((event) => ({
      type: event.type,
      createdAt: event.createdAt,
      organizationId: event.organizationId,
      shopId: event.shopId,
      shopSlug: event.shopSlug,
      shopName: event.shopName,
      organizationName: event.organizationName,
      amountKr: event.amountKr,
      transactionId: event.transactionId,
      path: event.path,
      visitorId: event.visitorId,
      actorEmail: event.actorEmail,
    }))

    const report = aggregateEventsForReport(rows)

    if (canSendPlatformReportEmail()) {
      await ctx.scheduler.runAfter(0, internal.email.sendPlatformActivityReport, {
        report,
        windowStart,
        windowEnd,
      })
    }

    await ctx.db.patch('platformReportState', state._id, {
      lastReportSentAt: windowEnd,
    })

    return null
  },
})
