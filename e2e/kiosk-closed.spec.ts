import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { grantSeasonAccess, setCommercialPlan } from './helpers/convex'
import { uniqueTestEmail } from './helpers/env'
import { createTestKiosk, createTestOrg } from './helpers/org'

test.describe('Public kiosk — Gratis limit', () => {
  test('closes extra kiosks after the plan returns to Gratis', async ({
    page,
    baseURL,
  }) => {
    const email = uniqueTestEmail('kiosk-closed')
    const orgName = `E2E Closed ${Date.now()}`
    const firstSlug = `e2e-open-${Date.now()}`
    const secondSlug = `e2e-closed-${Date.now()}`

    await loginAndOpen(page, email, '/skapa', baseURL)
    const organizationId = await createTestOrg(page, { email, orgName })
    grantSeasonAccess(organizationId)

    await createTestKiosk(page, baseURL!, {
      slug: firstSlug,
      kioskName: 'Första kiosken',
      swishNumber: '1234567890',
    })
    await createTestKiosk(page, baseURL!, {
      slug: secondSlug,
      kioskName: 'Andra kiosken',
      swishNumber: '1234567890',
    })

    setCommercialPlan(organizationId, 'gratis', 'canceled')

    await page.goto(`${baseURL}/s/${secondSlug}`, {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.getByText(/tillfälligt stängd/i)).toBeVisible({
      timeout: 30_000,
    })

    await page.goto(`${baseURL}/s/${firstSlug}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('heading', { name: 'Första kiosken' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText('Kiosk via QRButik')).toBeVisible()
  })
})
