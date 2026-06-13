/** Patterns used by Playwright E2E tests — keep in sync with `e2e/helpers/env.ts`. */

export const E2E_ORG_NAME_PREFIX = 'E2E '
export const E2E_SHOP_SLUG_PREFIX = 'e2e-'

export function isE2eTestEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return normalized.startsWith('e2e+') && normalized.endsWith('@qrbutik.test')
}

export function isE2eTestOrgName(name: string): boolean {
  return name.startsWith(E2E_ORG_NAME_PREFIX)
}

export function isE2eTestShopSlug(slug: string): boolean {
  return slug.startsWith(E2E_SHOP_SLUG_PREFIX)
}

export function isE2eTestOrganization(org: {
  name: string
  billingEmail: string
}): boolean {
  return isE2eTestOrgName(org.name) || isE2eTestEmail(org.billingEmail)
}

export function isE2eTestShop(shop: { slug: string }): boolean {
  return isE2eTestShopSlug(shop.slug)
}
