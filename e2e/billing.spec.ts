import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { isStripeE2EEnabled, uniqueTestEmail } from './helpers/env'

test.describe('Billing', () => {
  test('billing page shows trial and payment actions for new org', async ({
    page,
    baseURL,
  }) => {
    const email = uniqueTestEmail('billing')
    const orgName = `E2E Billing ${Date.now()}`

    await loginAndOpen(page, email, '/skapa', baseURL)

    await page.getByLabel('Föreningsnamn').fill(orgName)
    await page.getByLabel('Faktura-e-post').fill(email)
    await page.getByRole('button', { name: 'Skapa förening' }).click()
    await page.waitForURL(/\/admin\/billing/, { timeout: 30_000 })
    await expect(
      page.getByRole('heading', { name: 'Klubblicens & fakturering' }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('main').getByText(orgName)).toBeVisible({
      timeout: 30_000,
    })

    const stripeConfigured = await page
      .getByRole('button', { name: 'Betala med kort' })
      .isVisible()
      .catch(() => false)

    if (stripeConfigured) {
      await expect(
        page.getByRole('button', { name: 'Betala med kort' }),
      ).toBeEnabled()
      await expect(
        page.getByRole('button', { name: 'Betala med faktura' }),
      ).toBeEnabled()
    } else {
      await expect(
        page.getByText(/Stripe är inte konfigurerat|npm run stripe:setup/i),
      ).toBeVisible()
    }
  })

  test('card checkout opens Stripe when configured', async ({ page, baseURL }) => {
    test.skip(!isStripeE2EEnabled(), 'Set STRIPE_E2E=true to run Stripe checkout E2E')

    const email = uniqueTestEmail('stripe-checkout')
    const orgName = `E2E Stripe ${Date.now()}`

    await loginAndOpen(page, email, '/skapa', baseURL)

    await page.getByLabel('Föreningsnamn').fill(orgName)
    await page.getByLabel('Faktura-e-post').fill(email)
    await page.getByRole('button', { name: 'Skapa förening' }).click()

    await page.getByRole('button', { name: 'Betala med kort' }).click()

    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 30_000 })
  })
})
