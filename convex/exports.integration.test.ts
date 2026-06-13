/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api, internal } from './_generated/api'
import schema from './schema'
import {
  FIXTURE_NOW,
  asUser,
  seedMember,
  seedOrganization,
  seedShop,
  seedTransaction,
} from './test/fixtures'

describe('exports authorization', () => {
  it('treasurer can export org transactions in range', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId)
    await seedTransaction(t, shopId, {
      createdAt: FIXTURE_NOW,
      status: 'verified',
    })

    await seedMember(t, organizationId, {
      role: 'treasurer',
      email: 'treasurer@qrbutik.test',
    })

    const result = await t.run(async (ctx) => {
      return await ctx.runQuery(internal.exports.listTransactionsForExportInternal, {
        organizationId,
        callerEmail: 'treasurer@qrbutik.test',
        start: FIXTURE_NOW - 60_000,
        end: FIXTURE_NOW + 60_000,
      })
    })

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]?.amount).toBe(120)
  })

  it('editor cannot export via internal query', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId)

    await seedMember(t, organizationId, {
      role: 'editor',
      email: 'editor@qrbutik.test',
      assignedShopIds: [shopId],
    })

    await expect(
      t.run(async (ctx) => {
        return await ctx.runQuery(
          internal.exports.listTransactionsForExportInternal,
          {
            organizationId,
            callerEmail: 'editor@qrbutik.test',
            start: FIXTURE_NOW - 60_000,
            end: FIXTURE_NOW + 60_000,
          },
        )
      }),
    ).rejects.toThrow('Unauthorized: treasurer access required')
  })

  it('editor cannot export via public org query', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId)

    await seedMember(t, organizationId, {
      role: 'editor',
      email: 'editor@qrbutik.test',
      assignedShopIds: [shopId],
    })

    await expect(
      asUser(t, 'editor@qrbutik.test').query(
        api.exports.listTransactionsForExport,
        {
          organizationId,
          start: FIXTURE_NOW - 60_000,
          end: FIXTURE_NOW + 60_000,
        },
      ),
    ).rejects.toThrow('Unauthorized: treasurer access required')
  })
})
