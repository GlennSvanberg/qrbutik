import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { deactivateOrgForShopSlug } from './helpers/convex'
import { uniqueTestEmail } from './helpers/env'
import { createTestKiosk, createTestOrg } from './helpers/org'

test.describe('Public kiosk — inactive license', () => {
  test('shows tillfälligt stängd when org license is inactive', async ({
    page,
    baseURL,
  }) => {
    const email = uniqueTestEmail('kiosk-closed')
    const orgName = `E2E Closed ${Date.now()}`
    const kioskSlug = `e2e-closed-${Date.now()}`

    await loginAndOpen(page, email, '/skapa', baseURL)
    await createTestOrg(page, { email, orgName })

    await createTestKiosk(page, baseURL!, {
      slug: kioskSlug,
      swishNumber: '1234567890',
    })

    deactivateOrgForShopSlug(kioskSlug)

    await page.goto(`${baseURL}/s/${kioskSlug}`, {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.getByText(/tillfälligt stängd/i)).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByText(new RegExp(orgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
    ).toBeVisible()
  })
})
