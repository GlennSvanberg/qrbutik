import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { attachFindingsReporter } from './helpers/findings'
import { getTestBaseUrl, uniqueTestEmail } from './helpers/env'
import { createTestKiosk, createTestOrg } from './helpers/org'

attachFindingsReporter(test)

test.describe('Product management', () => {
  test('product added in admin is visible on public kiosk page', async ({
    page,
    baseURL,
  }) => {
    const appUrl = getTestBaseUrl(baseURL)
    const email = uniqueTestEmail('products')
    const orgName = `E2E Products ${Date.now()}`
    const kioskSlug = `e2e-products-${Date.now()}`
    const kioskName = 'Produktkiosk'
    const seedProduct = 'Kaffe'
    const newProduct = `E2E Produkt ${Date.now()}`

    await loginAndOpen(page, email, '/skapa', appUrl)
    await createTestOrg(page, { email, orgName })
    const { shopId } = await createTestKiosk(page, appUrl, {
      slug: kioskSlug,
      kioskName,
      products: [{ name: seedProduct, price: '20' }],
    })

    await page.goto(`${appUrl}/admin/${shopId}/products`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByRole('heading', { name: 'Produkter' })).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('button', { name: 'Lägg till en ny rad' }).click()
    const nameFields = page.getByLabel('Produktnamn')
    const priceFields = page.getByLabel('Pris (SEK)')
    await nameFields.last().fill(newProduct)
    await priceFields.last().fill('45')

    await page.getByRole('button', { name: 'Spara ändringar' }).click()
    await expect(page.getByText('Produkter sparade.')).toBeVisible({
      timeout: 15_000,
    })

    await page.goto(`${appUrl}/s/${kioskSlug}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(
      page.getByRole('heading', { name: kioskName }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(seedProduct)).toBeVisible()
    await expect(page.getByText(newProduct)).toBeVisible()
    await expect(page.getByText('45 kr')).toBeVisible()
  })
})
