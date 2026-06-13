import { expect, test } from '@playwright/test'
import { loginWithDevMagicLink } from './helpers/auth'
import { uniqueTestEmail } from './helpers/env'

test.describe('Authentication', () => {
  test('dev magic link login reaches admin', async ({ page, baseURL }) => {
    const email = uniqueTestEmail('login')

    await loginWithDevMagicLink(page, email, '/admin', baseURL)

    await expect(page).toHaveURL(/\/admin/)
    await expect(
      page.getByRole('heading', { name: 'Föreningens kiosker' }),
    ).toBeVisible({ timeout: 30_000 })
  })
})
