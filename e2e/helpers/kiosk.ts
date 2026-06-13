import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/** Capture Swish deep-links without leaving the checkout page (best-effort). */
export async function installSwishLocationStub(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(
        Location.prototype,
        'href',
      )
      if (!descriptor?.get || !descriptor.set) {
        return
      }

      const location = window.location
      Object.defineProperty(location, 'href', {
        configurable: true,
        enumerable: descriptor.enumerable,
        get() {
          return descriptor.get!.call(location)
        },
        set(value: string) {
          if (typeof value === 'string' && value.startsWith('swish://')) {
            return
          }
          descriptor.set!.call(location, value)
        },
      })
    } catch {
      // Localhost checkout already skips Swish redirect in the app.
    }
  })
}

export async function addProductToCart(
  page: Page,
  productName?: string,
): Promise<void> {
  const productsSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Produkter' }),
  })
  await expect(productsSection).toBeVisible({ timeout: 30_000 })

  if (productName) {
    const productRow = productsSection
      .locator('div.relaxed-surface-soft')
      .filter({
        has: page.getByRole('heading', { name: productName, exact: true }),
      })
    await expect(productRow).toHaveCount(1, { timeout: 15_000 })
    await productRow.getByRole('button').last().click()
  } else {
    await productsSection.getByRole('button').last().click()
  }

  await expect(page.getByText('Totalt att betala:')).toBeVisible({
    timeout: 15_000,
  })
}

export async function payWithSwish(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Betala med Swish' }).click()
  await page.waitForURL(/\/tack\//, { timeout: 20_000 })

  const match = new URL(page.url()).pathname.match(/\/tack\/([^/]+)/)
  if (!match?.[1]) {
    throw new Error(`Expected /tack/{id} URL, got ${page.url()}`)
  }

  return match[1]
}

export async function assertThankYouShowsReference(
  page: Page,
): Promise<string> {
  await expect(
    page.getByRole('heading', { name: 'Tack för ditt köp!' }),
  ).toBeVisible({ timeout: 15_000 })

  const referenceBlock = page
    .locator('section')
    .filter({ has: page.getByText('Referensnummer') })

  await expect(referenceBlock).toBeVisible()
  const reference = await referenceBlock.locator('p.text-2xl').textContent()

  if (!reference?.trim()) {
    throw new Error('Reference number not found on thank-you page')
  }

  expect(reference.trim()).toMatch(/^QRB-/)
  return reference.trim()
}
