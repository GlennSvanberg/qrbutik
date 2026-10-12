import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { isStripeE2EEnabled, uniqueTestEmail } from './helpers/env'

test.describe('Billing', () => {
  test('billing page shows Gratis, Event and Säsong', async ({
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

    await expect(page.getByText('295 kr').first()).toBeVisible()
    await expect(page.getByText('1 495 kr/år').first()).toBeVisible()
    await expect(page.getByText(/Nuvarande plan: Gratis/)).toBeVisible()

    const eventCheckout = page.getByRole('button', { name: 'Köp Event — 295 kr' })
    const seasonCheckout = page.getByRole('button', {
      name: 'Starta Säsong — 1 495 kr/år',
    })
    const stripeConfigured = await eventCheckout.isVisible().catch(() => false)

    if (stripeConfigured) {
      await expect(eventCheckout).toBeEnabled()
      await expect(seasonCheckout).toBeEnabled()
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

    await page.getByRole('button', { name: 'Starta Säsong — 1 495 kr/år' }).click()

    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 30_000 })
  })
})
