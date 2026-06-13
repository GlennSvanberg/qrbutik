import { expect } from '@playwright/test'
import {
  addProductToCart,
  installSwishLocationStub,
  payWithSwish,
} from './kiosk'
import type { Page } from '@playwright/test'

export async function purchaseProductOnKiosk(
  page: Page,
  baseURL: string,
  slug: string,
  options?: { kioskHeading?: string; productName?: string },
): Promise<void> {
  await installSwishLocationStub(page)
  await page.goto(`${baseURL}/s/${slug}`, { waitUntil: 'domcontentloaded' })

  if (options?.kioskHeading) {
    await expect(
      page.getByRole('heading', { name: options.kioskHeading }),
    ).toBeVisible({ timeout: 30_000 })
  }

  if (options?.productName) {
    await expect(page.getByText(options.productName)).toBeVisible({
      timeout: 30_000,
    })
  }

  await addProductToCart(page, options?.productName)
  await payWithSwish(page)
}

export async function verifyFirstPendingPayment(
  page: Page,
  baseURL: string,
  shopId: string,
): Promise<void> {
  await page.goto(`${baseURL}/admin/${shopId}/historik`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(
    page.getByRole('heading', { name: 'Alla köp' }),
  ).toBeVisible({ timeout: 30_000 })

  const pendingCheckbox = page
    .locator('input[type="checkbox"]:not(:checked)')
    .first()
  await expect(pendingCheckbox).toBeVisible({ timeout: 15_000 })
  await pendingCheckbox.click()
  await expect(page.getByText('Betalning verifierad.')).toBeVisible({
    timeout: 15_000,
  })
}

export function extractShopIdFromUrl(url: string): string {
  const match = url.match(/\/admin\/([^/?#]+)/)
  if (!match?.[1]) {
    throw new Error(`Could not extract shop id from URL: ${url}`)
  }
  return match[1]
}
