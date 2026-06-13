import { execSync } from 'node:child_process'
import { expect, test } from '@playwright/test'
import {
  addProductToCart,
  assertThankYouShowsReference,
  installSwishLocationStub,
  payWithSwish,
} from './helpers/kiosk'

test.describe('Public kiosk checkout', () => {
  test.beforeAll(() => {
    execSync('npm run demo:seed', {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: process.env,
    })
  })

  test('demo kiosk checkout reaches thank-you page with reference', async ({
    page,
    baseURL,
  }) => {
    await installSwishLocationStub(page)
    await page.goto(`${baseURL}/s/demo`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Demokiosk' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText('Korv med bröd')).toBeVisible({
      timeout: 30_000,
    })

    await addProductToCart(page, 'Korv med bröd')
    const transactionId = await payWithSwish(page)

    expect(transactionId.length).toBeGreaterThan(0)
    await expect(page).toHaveURL(new RegExp(`/tack/${transactionId}$`))

    const reference = await assertThankYouShowsReference(page)
    await expect(page.getByText(reference)).toBeVisible()
    await expect(page.getByText(/Korv med bröd/)).toBeVisible()
  })
})
