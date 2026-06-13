/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { internal } from './_generated/api'
import schema from './schema'
import { canSendPlatformReportEmail } from './lib/platformReports'

describe('platformReports', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not allow email when PLATFORM_REPORTS_ENABLED is unset', () => {
    vi.stubEnv('PLATFORM_REPORTS_ENABLED', '')
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', 'admin@qrbutik.se')
    expect(canSendPlatformReportEmail()).toBe(false)
  })

  it('allows email only when prod flag, resend, and admins are configured', () => {
    vi.stubEnv('PLATFORM_REPORTS_ENABLED', 'true')
    vi.stubEnv('RESEND_API_KEY', 're_test')
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', 'admin@qrbutik.se')
    expect(canSendPlatformReportEmail()).toBe(true)
  })

  it('updates report cursor without scheduling email when reports disabled', async () => {
    vi.stubEnv('PLATFORM_REPORTS_ENABLED', 'false')
    const t = convexTest(schema, convexModules)
    const now = Date.now()

    await t.run(async (ctx) => {
      await ctx.db.insert('platformEvents', {
        type: 'page_view',
        createdAt: now,
        path: '/',
        visitorId: 'visitor-1',
      })
    })

    await t.mutation(internal.platformReports.sendHourlyReport, {})

    const state = await t.run(async (ctx) => {
      return await ctx.db.query('platformReportState').collect()
    })

    expect(state).toHaveLength(1)
    expect(state[0]?.lastReportSentAt).toBeGreaterThanOrEqual(now)
  })

  it('skips e2e events when recording internally', async () => {
    const t = convexTest(schema, convexModules)

    const eventId = await t.mutation(internal.platformEvents.recordInternal, {
      type: 'shop_view',
      createdAt: Date.now(),
      shopSlug: 'e2e-checkout-123',
      shopName: 'E2E Shop',
      visitorId: 'visitor-1',
    })

    expect(eventId).toBeNull()

    const events = await t.run(async (ctx) => {
      return await ctx.db.query('platformEvents').collect()
    })
    expect(events).toHaveLength(0)
  })
})
