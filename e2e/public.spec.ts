import { expect, test } from '@playwright/test'

test.describe('Public marketing pages', () => {
  test('landing page shows B2B club license messaging', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /Klubblicens/i }).first(),
    ).toBeVisible()
    await expect(page.getByText('995 kr/mån')).toBeVisible()
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
