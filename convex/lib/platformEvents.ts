import { v } from 'convex/values'
import {
  isE2eTestEmail,
  isE2eTestOrgName,
  isE2eTestShopSlug,
} from './testData'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

export const platformEventTypeValidator = v.union(
  v.literal('org_created'),
  v.literal('shop_created'),
  v.literal('checkout_started'),
  v.literal('subscription_activated'),
  v.literal('shop_view'),
  v.literal('page_view'),
)

export type PlatformEventType = Doc<'platformEvents'>['type']

export type PlatformEventInput = {
  type: PlatformEventType
  createdAt: number
  organizationId?: Id<'organizations'>
  shopId?: Id<'shops'>
  shopSlug?: string
  shopName?: string
  organizationName?: string
  amountKr?: number
  transactionId?: Id<'transactions'>
  path?: string
  visitorId?: string
  actorEmail?: string
}

export type PlatformEventRow = {
  type: PlatformEventType
  createdAt: number
  organizationId?: Id<'organizations'>
  shopId?: Id<'shops'>
  shopSlug?: string
  shopName?: string
  organizationName?: string
  amountKr?: number
  transactionId?: Id<'transactions'>
  path?: string
  visitorId?: string
  actorEmail?: string
}

export type AggregatedPlatformReport = {
  totalEvents: number
  orgsCreated: Array<{ name: string; actorEmail?: string }>
  shopsCreated: Array<{ name: string; slug: string; organizationName?: string }>
  checkoutsStarted: {
    count: number
    totalKr: number
    byShop: Array<{ shopName: string; shopSlug: string; count: number; totalKr: number }>
  }
  subscriptionsActivated: Array<{ organizationName: string }>
  shopVisits: Array<{ shopSlug: string; shopName: string; uniqueVisitors: number }>
  pageViews: Array<{ path: string; uniqueVisitors: number }>
}

export const aggregatedPlatformReportValidator = v.object({
  totalEvents: v.number(),
  orgsCreated: v.array(
    v.object({
      name: v.string(),
      actorEmail: v.optional(v.string()),
    }),
  ),
  shopsCreated: v.array(
    v.object({
      name: v.string(),
      slug: v.string(),
      organizationName: v.optional(v.string()),
    }),
  ),
  checkoutsStarted: v.object({
    count: v.number(),
    totalKr: v.number(),
    byShop: v.array(
      v.object({
        shopName: v.string(),
        shopSlug: v.string(),
        count: v.number(),
        totalKr: v.number(),
      }),
    ),
  }),
  subscriptionsActivated: v.array(
    v.object({
      organizationName: v.string(),
    }),
  ),
  shopVisits: v.array(
    v.object({
      shopSlug: v.string(),
      shopName: v.string(),
      uniqueVisitors: v.number(),
    }),
  ),
  pageViews: v.array(
    v.object({
      path: v.string(),
      uniqueVisitors: v.number(),
    }),
  ),
})

export function shouldSkipPlatformEvent(event: PlatformEventInput): boolean {
  if (event.actorEmail && isE2eTestEmail(event.actorEmail)) {
    return true
  }
  if (event.organizationName && isE2eTestOrgName(event.organizationName)) {
    return true
  }
  if (event.shopSlug && isE2eTestShopSlug(event.shopSlug)) {
    return true
  }
  return false
}

export function shouldIncludeStoredPlatformEvent(event: PlatformEventRow): boolean {
  return !shouldSkipPlatformEvent(event)
}

export async function recordPlatformEvent(
  ctx: MutationCtx,
  event: PlatformEventInput,
): Promise<Id<'platformEvents'> | null> {
  if (shouldSkipPlatformEvent(event)) {
    return null
  }

  return await ctx.db.insert('platformEvents', {
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
  })
}

export function aggregateEventsForReport(
  events: Array<PlatformEventRow>,
): AggregatedPlatformReport {
  const orgsCreated: AggregatedPlatformReport['orgsCreated'] = []
  const shopsCreated: AggregatedPlatformReport['shopsCreated'] = []
  const subscriptionsActivated: AggregatedPlatformReport['subscriptionsActivated'] =
    []

  const checkoutByShop = new Map<
    string,
    { shopName: string; shopSlug: string; count: number; totalKr: number }
  >()
  let checkoutCount = 0
  let checkoutTotalKr = 0

  const shopVisitSets = new Map<
    string,
    { shopName: string; visitors: Set<string> }
  >()
  const pageViewSets = new Map<string, Set<string>>()

  for (const event of events) {
    switch (event.type) {
      case 'org_created':
        if (event.organizationName) {
          orgsCreated.push({
            name: event.organizationName,
            actorEmail: event.actorEmail,
          })
        }
        break
      case 'shop_created':
        if (event.shopName && event.shopSlug) {
          shopsCreated.push({
            name: event.shopName,
            slug: event.shopSlug,
            organizationName: event.organizationName,
          })
        }
        break
      case 'checkout_started': {
        checkoutCount += 1
        const amount = event.amountKr ?? 0
        checkoutTotalKr += amount
        const slug = event.shopSlug ?? 'unknown'
        const existing = checkoutByShop.get(slug)
        if (existing) {
          existing.count += 1
          existing.totalKr += amount
        } else {
          checkoutByShop.set(slug, {
            shopName: event.shopName ?? slug,
            shopSlug: slug,
            count: 1,
            totalKr: amount,
          })
        }
        break
      }
      case 'subscription_activated':
        if (event.organizationName) {
          subscriptionsActivated.push({ organizationName: event.organizationName })
        }
        break
      case 'shop_view': {
        if (!event.shopSlug || !event.visitorId) break
        const entry = shopVisitSets.get(event.shopSlug) ?? {
          shopName: event.shopName ?? event.shopSlug,
          visitors: new Set<string>(),
        }
        entry.visitors.add(event.visitorId)
        shopVisitSets.set(event.shopSlug, entry)
        break
      }
      case 'page_view': {
        if (!event.path || !event.visitorId) break
        const visitors = pageViewSets.get(event.path) ?? new Set<string>()
        visitors.add(event.visitorId)
        pageViewSets.set(event.path, visitors)
        break
      }
    }
  }

  const shopVisits = Array.from(shopVisitSets.entries())
    .map(([shopSlug, { shopName, visitors }]) => ({
      shopSlug,
      shopName,
      uniqueVisitors: visitors.size,
    }))
    .sort((a, b) => b.uniqueVisitors - a.uniqueVisitors)

  const pageViews = Array.from(pageViewSets.entries())
    .map(([path, visitors]) => ({
      path,
      uniqueVisitors: visitors.size,
    }))
    .sort((a, b) => b.uniqueVisitors - a.uniqueVisitors)

  const byShop = Array.from(checkoutByShop.values()).sort(
    (a, b) => b.count - a.count,
  )

  return {
    totalEvents: events.length,
    orgsCreated,
    shopsCreated,
    checkoutsStarted: {
      count: checkoutCount,
      totalKr: checkoutTotalKr,
      byShop,
    },
    subscriptionsActivated,
    shopVisits,
    pageViews,
  }
}

export function aggregateActivitySummary(
  events: Array<PlatformEventRow>,
): {
  orgsCreated: number
  shopsCreated: number
  checkoutCount: number
  checkoutRevenueKr: number
  shopVisits: Array<{ shopSlug: string; shopName: string; uniqueVisitors: number }>
  pageViews: Array<{ path: string; uniqueVisitors: number }>
} {
  const report = aggregateEventsForReport(events)
  return {
    orgsCreated: report.orgsCreated.length,
    shopsCreated: report.shopsCreated.length,
    checkoutCount: report.checkoutsStarted.count,
    checkoutRevenueKr: report.checkoutsStarted.totalKr,
    shopVisits: report.shopVisits,
    pageViews: report.pageViews,
  }
}

export function formatPlatformReportHtml(
  report: AggregatedPlatformReport,
  windowStart: number,
  windowEnd: number,
): string {
  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })

  const sections: Array<string> = []

  if (report.orgsCreated.length > 0) {
    sections.push(
      `<h3>Nya föreningar (${report.orgsCreated.length})</h3><ul>${report.orgsCreated
        .map((o) => `<li>${escapeHtml(o.name)}${o.actorEmail ? ` — ${escapeHtml(o.actorEmail)}` : ''}</li>`)
        .join('')}</ul>`,
    )
  }

  if (report.shopsCreated.length > 0) {
    sections.push(
      `<h3>Nya kiosker (${report.shopsCreated.length})</h3><ul>${report.shopsCreated
        .map(
          (s) =>
            `<li>${escapeHtml(s.name)} (${escapeHtml(s.slug)})${s.organizationName ? ` — ${escapeHtml(s.organizationName)}` : ''}</li>`,
        )
        .join('')}</ul>`,
    )
  }

  if (report.checkoutsStarted.count > 0) {
    sections.push(
      `<h3>Köp påbörjade (${report.checkoutsStarted.count})</h3><p>Totalt ${report.checkoutsStarted.totalKr} kr</p><ul>${report.checkoutsStarted.byShop
        .map(
          (s) =>
            `<li>${escapeHtml(s.shopName)}: ${s.count} köp, ${s.totalKr} kr</li>`,
        )
        .join('')}</ul>`,
    )
  }

  if (report.subscriptionsActivated.length > 0) {
    sections.push(
      `<h3>Prenumerationer aktiverade (${report.subscriptionsActivated.length})</h3><ul>${report.subscriptionsActivated
        .map((s) => `<li>${escapeHtml(s.organizationName)}</li>`)
        .join('')}</ul>`,
    )
  }

  if (report.shopVisits.length > 0) {
    sections.push(
      `<h3>Kioskbesök</h3><ul>${report.shopVisits
        .map(
          (s) =>
            `<li>${escapeHtml(s.shopName)} (${escapeHtml(s.shopSlug)}): ${s.uniqueVisitors} besökare</li>`,
        )
        .join('')}</ul>`,
    )
  }

  if (report.pageViews.length > 0) {
    sections.push(
      `<h3>Sidvisningar</h3><ul>${report.pageViews
        .map((p) => `<li>${escapeHtml(p.path)}: ${p.uniqueVisitors} besökare</li>`)
        .join('')}</ul>`,
    )
  }

  return `<p>Period: ${formatTime(windowStart)} – ${formatTime(windowEnd)}</p>${sections.join('')}`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
