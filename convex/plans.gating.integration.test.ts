/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api, internal } from './_generated/api'
import { ADMIN_LIMIT_ERROR, KIOSK_CLOSED_ERROR, KIOSK_LIMIT_ERROR, SALES_EXPORT_ERROR, SALES_REPORT_ERROR } from './lib/plans'
import schema from './schema'
import {
  FIXTURE_NOW,
  asUser,
  seedInvitation,
  seedOrganization,
  seedProduct,
  seedShop,
} from './test/fixtures'

describe('plan gating', () => {
  it('blocks a second kiosk and keeps the first one sellable on Gratis', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId, ownerEmail } = await seedOrganization(t, {
      status: 'inactive',
      plan: 'gratis',
    })
    const { shopId } = await seedShop(t, organizationId, { slug: 'first-kiosk' })
    await seedProduct(t, shopId)
    await t.run(async (ctx) => {
      await ctx.db.insert('shops', {
        organizationId,
        name: 'Second',
        slug: 'second-kiosk',
        swishNumber: '1234567890',
        createdAt: FIXTURE_NOW + 1,
      })
    })

    await expect(
      asUser(t, ownerEmail).mutation(api.shops.createShopInOrganization, {
        organizationId,
        name: 'Third',
        swishNumber: '1234567890',
        products: [],
      }),
    ).rejects.toThrow(KIOSK_LIMIT_ERROR)

    const open = await t.mutation(api.transactions.create, {
      shopId,
      amount: 60,
      reference: 'QRB-OPEN',
      items: [{ name: 'Korv', price: 60, quantity: 1 }],
    })
    expect(open).toBeDefined()

    const shops = await t.run(async (ctx) =>
      ctx.db
        .query('shops')
        .withIndex('by_organizationId', (q) =>
          q.eq('organizationId', organizationId),
        )
        .collect(),
    )
    const second = shops.find((shop) => shop.slug === 'second-kiosk')
    await expect(
      t.mutation(api.transactions.create, {
        shopId: second!._id,
        amount: 60,
        reference: 'QRB-CLOSED',
        items: [{ name: 'Korv', price: 60, quantity: 1 }],
      }),
    ).rejects.toThrow(KIOSK_CLOSED_ERROR)

    const license = await t.query(api.shops.getShopWithLicenseBySlug, {
      slug: 'first-kiosk',
    })
    expect(license?.licenseActive).toBe(true)
    expect(license?.showBranding).toBe(true)

    const closed = await t.query(api.shops.getShopWithLicenseBySlug, {
      slug: 'second-kiosk',
    })
    expect(closed?.licenseActive).toBe(false)
    expect(closed?.showBranding).toBe(true)
  })

  it('lets a grandfathered 995 subscription sell on every kiosk without branding', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t, {
      status: 'active',
      stripeSubscriptionId: 'sub_legacy',
    })
    const { shopId } = await seedShop(t, organizationId, { slug: 'legacy-a' })
    await t.run(async (ctx) => {
      await ctx.db.insert('shops', {
        organizationId,
        name: 'Legacy B',
        slug: 'legacy-b',
        swishNumber: '1234567890',
        createdAt: FIXTURE_NOW + 5,
      })
    })
    await seedProduct(t, shopId)

    const license = await t.query(api.shops.getShopWithLicenseBySlug, {
      slug: 'legacy-b',
    })
    expect(license?.licenseActive).toBe(true)
    expect(license?.showBranding).toBe(false)
  })

  it('blocks a second administrator on Gratis and Event', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId, ownerEmail } = await seedOrganization(t, {
      status: 'inactive',
      plan: 'event',
      eventExpiresAt: FIXTURE_NOW + 86_400_000,
    })

    await expect(
      asUser(t, ownerEmail).mutation(api.members.inviteMember, {
        organizationId,
        email: 'kassor@qrbutik.test',
        role: 'treasurer',
      }),
    ).rejects.toThrow(ADMIN_LIMIT_ERROR)

    const { token } = await seedInvitation(t, organizationId, {
      email: 'editor@qrbutik.test',
      role: 'treasurer',
    })
    await expect(
      asUser(t, 'editor@qrbutik.test').mutation(api.members.acceptInvitation, {
        token,
      }),
    ).rejects.toThrow(ADMIN_LIMIT_ERROR)
  })

  it('gates sales report and export, and allows them on Event', async () => {
    const t = convexTest(schema, convexModules)
    const gratis = await seedOrganization(t, {
      status: 'inactive',
      plan: 'gratis',
      ownerEmail: 'gratis@qrbutik.test',
    })
    const { shopId } = await seedShop(t, gratis.organizationId)

    await expect(
      asUser(t, gratis.ownerEmail).query(
        api.orgDashboard.getOrganizationDashboardSummary,
        {
          organizationId: gratis.organizationId,
          filter: { kind: 'period', period: 'last7' },
        },
      ),
    ).rejects.toThrow(SALES_REPORT_ERROR)

    const today = await asUser(t, gratis.ownerEmail).query(
      api.orgDashboard.getOrganizationDashboardSummary,
      {
        organizationId: gratis.organizationId,
        filter: { kind: 'period', period: 'today' },
      },
    )
    expect(today.shops[0]?.shopId).toBe(shopId)

    await expect(
      asUser(t, gratis.ownerEmail).query(api.exports.listTransactionsForExport, {
        organizationId: gratis.organizationId,
        start: FIXTURE_NOW - 1000,
        end: FIXTURE_NOW + 1000,
        format: 'excel',
      }),
    ).rejects.toThrow(SALES_EXPORT_ERROR)

    const event = await seedOrganization(t, {
      status: 'inactive',
      plan: 'event',
      eventExpiresAt: FIXTURE_NOW + 86_400_000,
      ownerEmail: 'event@qrbutik.test',
    })
    await seedShop(t, event.organizationId, { slug: 'event-kiosk' })
    const rows = await asUser(t, event.ownerEmail).query(
      api.exports.listTransactionsForExport,
      {
        organizationId: event.organizationId,
        start: FIXTURE_NOW - 1000,
        end: FIXTURE_NOW + 1000,
        format: 'excel',
      },
    )
    expect(rows).toEqual([])

    await expect(
      t.run(async (ctx) =>
        ctx.runQuery(internal.exports.listTransactionsForExportInternal, {
          organizationId: event.organizationId,
          callerEmail: event.ownerEmail,
          start: FIXTURE_NOW - 1000,
          end: FIXTURE_NOW + 1000,
          format: 'sie',
        }),
      ),
    ).rejects.toThrow('Bokföringsexport ingår i Säsong.')
  })
})
