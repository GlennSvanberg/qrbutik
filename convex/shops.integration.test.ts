/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api } from './_generated/api'
import schema from './schema'
import {
  asUser,
  seedMember,
  seedOrganization,
  seedProduct,
  seedShop,
  seedTransaction,
} from './test/fixtures'

describe('createShopInOrganization', () => {
  it('rejects editor role', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId)

    await seedMember(t, organizationId, {
      role: 'editor',
      email: 'editor@qrbutik.test',
      assignedShopIds: [shopId],
    })

    await expect(
      asUser(t, 'editor@qrbutik.test').mutation(
        api.shops.createShopInOrganization,
        {
          organizationId,
          name: 'Editor kiosk',
          swishNumber: '1234567890',
          products: [{ name: 'Korv', price: 60 }],
        },
      ),
    ).rejects.toThrow()
  })

  it('throws when explicit slug collides', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId, ownerEmail } = await seedOrganization(t)
    await seedShop(t, organizationId, { slug: 'taken-slug' })

    await expect(
      asUser(t, ownerEmail).mutation(api.shops.createShopInOrganization, {
        organizationId,
        name: 'Another kiosk',
        swishNumber: '1234567890',
        slug: 'taken-slug',
        products: [],
      }),
    ).rejects.toThrow('Slug är redan upptagen.')
  })

  it('auto-suffixes slug when name collides without explicit slug', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId, ownerEmail } = await seedOrganization(t)
    await seedShop(t, organizationId, { slug: 'collision-kiosk', name: 'Collision kiosk' })

    const result = await asUser(t, ownerEmail).mutation(
      api.shops.createShopInOrganization,
      {
        organizationId,
        name: 'Collision kiosk',
        swishNumber: '1234567890',
        products: [{ name: 'Korv', price: 60 }],
      },
    )

    expect(result.slug).toBe('collision-kiosk-2')
  })
})

describe('deleteShop', () => {
  it('cascades products and transactions', async () => {
    const t = convexTest(schema, convexModules)
    const { organizationId, ownerEmail } = await seedOrganization(t)
    const { shopId } = await seedShop(t, organizationId, { slug: 'delete-me' })
    const productId = await seedProduct(t, shopId)
    const transactionId = await seedTransaction(t, shopId)

    await asUser(t, ownerEmail).mutation(api.shops.deleteShop, { shopId })

    const remaining = await t.run(async (ctx) => {
      const shop = await ctx.db.get('shops', shopId)
      const product = await ctx.db.get('products', productId)
      const transaction = await ctx.db.get('transactions', transactionId)
      return { shop, product, transaction }
    })

    expect(remaining.shop).toBeNull()
    expect(remaining.product).toBeNull()
    expect(remaining.transaction).toBeNull()
  })
})
