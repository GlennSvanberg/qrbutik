/** Public demo kiosk slug — must match convex/demoSeed.ts DEMO_SHOP_SLUG */
export const DEMO_SHOP_SLUG = 'demo'

export function isDemoShopSlug(slug: string): boolean {
  return slug === DEMO_SHOP_SLUG
}

export function isDemoShopName(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return normalized === 'demokiosk' || normalized.includes('demo')
}
