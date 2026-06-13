/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api } from './_generated/api'
import schema from './schema'
import {
  FIXTURE_NOW,
  asUser,
  seedOrganization,
  seedShop,
  seedTransaction,
} from './test/fixtures'

describe('getOrganizationDashboardSummary vs export', () => {
  it('transactionCount matches export rows for the same range filter', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId, ownerEmail } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId)

    await seedTransaction(t, shopId, {
      createdAt: FIXTURE_NOW,
      status: 'verified',
      amount: 120,
    })
    await seedTransaction(t, shopId, {
      createdAt: FIXTURE_NOW - 60_000,
      status: 'verified',
      amount: 60,
    })
    await seedTransaction(t, shopId, {
      createdAt: FIXTURE_NOW - 30_000,
      status: 'pending',
      amount: 30,
    })

    const start = FIXTURE_NOW - 120_000
    const end = FIXTURE_NOW + 60_000
    const filter = { kind: 'range' as const, start, end }

    const dashboard = await asUser(t, ownerEmail).query(
      api.orgDashboard.getOrganizationDashboardSummary,
      {
        organizationId,
        filter,
      },
    )

    const exportRows = await asUser(t, ownerEmail).query(
      api.exports.listTransactionsForExport,
      {
        organizationId,
        start,
        end,
      },
    )

    expect(dashboard.transactionCount).toBe(exportRows.length)
    expect(dashboard.transactionCount).toBe(2)
    expect(exportRows).toHaveLength(2)
  })
})
