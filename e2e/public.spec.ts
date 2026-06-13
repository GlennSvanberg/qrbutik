import { expect, test } from '@playwright/test'

test.describe('Public marketing pages', () => {
  test('landing page shows B2B club license messaging', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /Klubblicens/i }).first(),
    ).toBeVisible()
    await expect(page.getByText('från 995 kr/mån').first()).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Logga in' }).first(),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Prova live kiosk' }).first(),
    ).toBeVisible()
  })

  test('demo kiosk shows products and demo banner', async ({ page }) => {
    await page.goto('/s/demo')
    await expect(
      page.getByRole('heading', { name: 'Demokiosk' }),
    ).toBeVisible()
    await expect(page.getByText('Demo av QRButik')).toBeVisible()
    await expect(page.getByText('Korv med bröd')).toBeVisible()
    await expect(page.getByText('Kaffe')).toBeVisible()
    await expect(page.getByText('Läsk 33 cl')).toBeVisible()
  })

  test('legal pages are reachable', async ({ page }) => {
    await page.goto('/villkor')
    await expect(
      page.getByRole('heading', { name: 'Användarvillkor (B2B)' }),
    ).toBeVisible()

    await page.goto('/integritet')
    await expect(
      page.getByRole('heading', { name: 'Integritetspolicy' }),
    ).toBeVisible()
  })
})
