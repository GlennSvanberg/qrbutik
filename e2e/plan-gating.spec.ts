import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { uniqueTestEmail } from './helpers/env'
import { createTestKiosk, createTestOrg } from './helpers/org'

test.describe('Plan gating', () => {
  test('Gratis blocks a second kiosk', async ({ page, baseURL }) => {
    const email = uniqueTestEmail('plan-gate')
    const orgName = `E2E Gate ${Date.now()}`

    await loginAndOpen(page, email, '/skapa', baseURL)
    await createTestOrg(page, { email, orgName })
    await createTestKiosk(page, baseURL!, {
      slug: `e2e-gate-${Date.now()}`,
      swishNumber: '1234567890',
    })

    await page.goto(`${baseURL}/admin/skapa-kiosk`, {
      waitUntil: 'domcontentloaded',
    })
    await page.getByLabel('Kiosknamn').fill('Andra kiosken')
    await page.getByLabel('Swish-nummer').fill('1234567890')
    await page.getByLabel('Kioskens webbadress (slug)').fill(`e2e-gate-b-${Date.now()}`)
    await expect(page.getByText('Adressen är ledig.')).toBeVisible({
      timeout: 15_000,
    })
    await page.getByLabel('Produktnamn').fill('Korv')
    await page.getByLabel('Pris (SEK)').fill('25')
    await page.getByRole('button', { name: 'Skapa kiosk' }).click()

    await expect(page.getByText(/Gratisplanen inkluderar 1 kiosk/)).toBeVisible({
      timeout: 15_000,
    })
  })
})
