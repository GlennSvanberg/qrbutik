import { describe, expect, it } from 'vitest'
import { DEMO_SHOP_SLUG, isDemoShopName, isDemoShopSlug } from './demo'

describe('demo helpers', () => {
  it('matches demo shop slug', () => {
    expect(isDemoShopSlug('demo')).toBe(true)
    expect(isDemoShopSlug('glenn')).toBe(false)
    expect(DEMO_SHOP_SLUG).toBe('demo')
  })

  it('matches demo shop names', () => {
    expect(isDemoShopName('Demokiosk')).toBe(true)
    expect(isDemoShopName('QRButik Demo IF')).toBe(true)
    expect(isDemoShopName('IFK Stockholm kiosk')).toBe(false)
  })
})
