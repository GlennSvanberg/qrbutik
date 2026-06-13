import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { uniqueTestEmail } from './helpers/env'
import { addProductToCart, installSwishLocationStub, payWithSwish } from './helpers/kiosk'
import { createTestOrg } from './helpers/org'

test.describe('Admin kiosk verification', () => {
  test('treasurer can verify checkout from historik', async ({
    page,
    baseURL,
  }) => {
    const email = uniqueTestEmail('kiosk-verify')
    const orgName = `E2E Verify ${Date.now()}`
    const kioskSlug = `e2e-verify-${Date.now()}`
    const productName = 'Korv med bröd'

    await loginAndOpen(page, email, '/skapa', baseURL)
    await createTestOrg(page, { email, orgName })

    await page.goto(`${baseURL}/admin/skapa-kiosk`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(
      page.getByRole('heading', { name: 'Skapa kiosk' }),
    ).toBeVisible({ timeout: 30_000 })

    await page.getByLabel('Kiosknamn').fill('Verifykiosk')
    await page.getByLabel('Swish-nummer').fill('1234567890')
    await page.getByLabel('Kioskens webbadress (slug)').fill(kioskSlug)
    await expect(page.getByText('Adressen är ledig.')).toBeVisible({
      timeout: 15_000,
    })

    await page.getByLabel('Produktnamn').fill(productName)
    await page.getByLabel('Pris (SEK)').fill('25')
    await page.getByRole('button', { name: 'Skapa kiosk' }).click()
    await page.waitForURL(
      (url) => {
        const { pathname } = new URL(url)
        return (
          /^\/admin\/[a-z0-9]+$/i.test(pathname) &&
          pathname !== '/admin/billing' &&
          pathname !== '/admin/skapa-kiosk' &&
          pathname !== '/admin/medlemmar'
        )
      },
      { timeout: 30_000 },
    )

    const shopId = new URL(page.url()).pathname.split('/').pop()
    expect(shopId).toBeTruthy()

    await installSwishLocationStub(page)
    await page.goto(`${baseURL}/s/${kioskSlug}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('heading', { name: 'Verifykiosk' })).toBeVisible(
      { timeout: 30_000 },
    )

    await addProductToCart(page, productName)
    await payWithSwish(page)

    await page.goto(`${baseURL}/admin/${shopId}/historik`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('heading', { name: 'Alla köp' })).toBeVisible({
      timeout: 30_000,
    })

    const pendingCheckbox = page
      .locator('input[type="checkbox"]:not(:checked)')
      .first()
    await expect(pendingCheckbox).toBeVisible({ timeout: 15_000 })
    await pendingCheckbox.click()

    await expect(page.getByText('Betalning verifierad.')).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText('Verifierad').first()).toBeVisible()
  })
})
