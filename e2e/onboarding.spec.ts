import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { uniqueTestEmail } from './helpers/env'

test.describe('Organization onboarding', () => {
  test('create organization and land on billing', async ({ page, baseURL }) => {
    const email = uniqueTestEmail('onboarding')
    const orgName = `E2E Förening ${Date.now()}`

    await loginAndOpen(page, email, '/skapa', baseURL)

    await page.getByLabel('Föreningsnamn').fill(orgName)
    await page.getByLabel('Faktura-e-post').fill(email)
    await page.getByRole('button', { name: 'Skapa förening' }).click()
    await page.waitForURL(/\/admin\/billing/, { timeout: 30_000 })
    await expect(
      page.getByRole('heading', { name: 'Klubblicens & fakturering' }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(orgName)).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('995 kr/mån').first()).toBeVisible()
  })
})
