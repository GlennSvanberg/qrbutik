import { describe, expect, it } from 'vitest'
import {
  aggregateActivitySummary,
  aggregateEventsForReport,
  shouldSkipPlatformEvent,
} from './platformEvents'

describe('platformEvents aggregation', () => {
  it('returns empty sections for no events', () => {
    const report = aggregateEventsForReport([])
    expect(report.totalEvents).toBe(0)
    expect(report.orgsCreated).toEqual([])
    expect(report.checkoutsStarted.count).toBe(0)
    expect(report.shopVisits).toEqual([])
    expect(report.pageViews).toEqual([])
  })

  it('counts unique shop and page visitors', () => {
    const report = aggregateEventsForReport([
      {
        type: 'shop_view',
        createdAt: 1,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        visitorId: 'a',
      },
      {
        type: 'shop_view',
        createdAt: 2,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        visitorId: 'a',
      },
      {
        type: 'shop_view',
        createdAt: 3,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        visitorId: 'b',
      },
      {
        type: 'page_view',
        createdAt: 4,
        path: '/glenn',
        visitorId: 'a',
      },
      {
        type: 'page_view',
        createdAt: 5,
        path: '/kontakt',
        visitorId: 'c',
      },
    ])

    expect(report.shopVisits).toEqual([
      { shopSlug: 'demo', shopName: 'Demokiosk', uniqueVisitors: 2 },
    ])
    expect(report.pageViews).toEqual([
      { path: '/glenn', uniqueVisitors: 1 },
      { path: '/kontakt', uniqueVisitors: 1 },
    ])
  })

  it('aggregates checkout totals by shop', () => {
    const report = aggregateEventsForReport([
      {
        type: 'checkout_started',
        createdAt: 1,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        amountKr: 50,
      },
      {
        type: 'checkout_started',
        createdAt: 2,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        amountKr: 30,
      },
    ])

    expect(report.checkoutsStarted.count).toBe(2)
    expect(report.checkoutsStarted.totalKr).toBe(80)
    expect(report.checkoutsStarted.byShop[0]).toEqual({
      shopName: 'Demokiosk',
      shopSlug: 'demo',
      count: 2,
      totalKr: 80,
    })
  })

  it('summarizes activity counts for dashboard', () => {
    const summary = aggregateActivitySummary([
      {
        type: 'org_created',
        createdAt: 1,
        organizationName: 'Glenn IK',
      },
      {
        type: 'shop_created',
        createdAt: 2,
        shopSlug: 'cup',
        shopName: 'Cupkiosk',
      },
      {
        type: 'checkout_started',
        createdAt: 3,
        shopSlug: 'demo',
        shopName: 'Demokiosk',
        amountKr: 40,
      },
    ])

    expect(summary.orgsCreated).toBe(1)
    expect(summary.shopsCreated).toBe(1)
    expect(summary.checkoutCount).toBe(1)
    expect(summary.checkoutRevenueKr).toBe(40)
  })
})

describe('shouldSkipPlatformEvent', () => {
  it('skips e2e org, shop, and email patterns', () => {
    expect(
      shouldSkipPlatformEvent({
        type: 'org_created',
        createdAt: 1,
        organizationName: 'E2E Test',
      }),
    ).toBe(true)
    expect(
      shouldSkipPlatformEvent({
        type: 'shop_view',
        createdAt: 1,
        shopSlug: 'e2e-checkout-1',
      }),
    ).toBe(true)
    expect(
      shouldSkipPlatformEvent({
        type: 'org_created',
        createdAt: 1,
        actorEmail: 'e2e+foo@qrbutik.test',
      }),
    ).toBe(true)
    expect(
      shouldSkipPlatformEvent({
        type: 'page_view',
        createdAt: 1,
        path: '/',
        visitorId: 'x',
      }),
    ).toBe(false)
  })
})
