/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { convexModules } from '../convex-test/modules'
import { api, internal } from './_generated/api'
import schema from './schema'

describe('demoSeed', () => {
  it('creates the public demo kiosk and is safe to run again', async () => {
    const t = convexTest(schema, convexModules)

    const first = await t.mutation(internal.demoSeed.ensureDemoShop, {})
    const second = await t.mutation(internal.demoSeed.ensureDemoShop, {})

    expect(first.slug).toBe('demo')
    expect(first.productCount).toBe(8)
    expect(second.shopId).toBe(first.shopId)
    expect(second.organizationId).toBe(first.organizationId)

    const shop = await t.query(api.shops.getShopWithLicenseBySlug, {
      slug: 'demo',
    })
    expect(shop?.shop.name).toBe('Demokiosk')
    expect(shop?.licenseActive).toBe(true)

    const products = await t.query(api.products.listByShop, {
      shopId: first.shopId,
    })
    expect(products.map((product) => product.name)).toContain('Korv med bröd')
  })
})
