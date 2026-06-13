import { execSync } from 'node:child_process'

export function runConvex<T>(
  functionName: string,
  args: Record<string, unknown> = {},
): T {
  const argsJson = JSON.stringify(args)
  const output = execSync(
    `npx convex run ${functionName} ${JSON.stringify(argsJson)}`,
    {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    },
  ).trim()

  if (!output) {
    return null as T
  }

  return JSON.parse(output) as T
}

type ShopRecord = {
  _id: string
  organizationId: string
  slug: string
  name: string
}

export function getShopBySlug(slug: string): ShopRecord | null {
  return runConvex<ShopRecord | null>('shops:getShopBySlug', { slug })
}

export type SubscriptionStatus =
  | 'inactive'
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'past_due'

export function setOrgSubscriptionStatus(
  organizationId: string,
  subscriptionStatus: SubscriptionStatus,
): void {
  runConvex('internal.organizations.setSubscriptionStatus', {
    organizationId,
    subscriptionStatus,
  })
}

export function deactivateOrgForShopSlug(slug: string): void {
  const shop = getShopBySlug(slug)
  if (!shop) {
    throw new Error(`Shop not found for slug: ${slug}`)
  }
  setOrgSubscriptionStatus(shop.organizationId, 'inactive')
}

export function cleanupE2eTestData(): {
  deletedOrganizations: number
  deletedShops: number
} {
  return runConvex('internal.testCleanup.cleanupE2eData', {})
}
