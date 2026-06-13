import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function createTestOrg(
  page: Page,
  options: { email: string; orgName: string; billingEmail?: string },
): Promise<void> {
  await page.getByLabel('Föreningsnamn').fill(options.orgName)
  await page
    .getByLabel('Faktura-e-post')
    .fill(options.billingEmail ?? options.email)
  await page.getByRole('button', { name: 'Skapa förening' }).click()
  await page.waitForURL(/\/admin\/billing/, { timeout: 30_000 })
  await expect(
    page.getByRole('heading', { name: 'Klubblicens & fakturering' }),
  ).toBeVisible({ timeout: 30_000 })
}

export type CreateTestKioskOptions = {
  slug: string
  kioskName?: string
  swishNumber?: string
  products?: Array<{ name: string; price: string }>
}

export type CreateTestKioskResult = {
  shopId: string
  publicUrl: string
  kioskName: string
}

export async function createTestKiosk(
  page: Page,
  baseURL: string,
  options: CreateTestKioskOptions,
): Promise<CreateTestKioskResult> {
  await page.goto(`${baseURL}/admin/skapa-kiosk`, {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.getByRole('heading', { name: 'Skapa kiosk' }),
  ).toBeVisible({ timeout: 30_000 })

  const kioskName = options.kioskName ?? `Kiosk ${options.slug}`
  const swishNumber = options.swishNumber ?? '1234567890'
  const products = options.products ?? [
    { name: 'Korv med bröd', price: '25' },
  ]

  await page.getByLabel('Kiosknamn').fill(kioskName)
  await page.getByLabel('Swish-nummer').fill(swishNumber)
  await page.getByLabel('Kioskens webbadress (slug)').fill(options.slug)
  await expect(page.getByText('Adressen är ledig.')).toBeVisible({
    timeout: 15_000,
  })

  for (const [index, product] of products.entries()) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Lägg till en ny rad' }).click()
    }
    const nameFields = page.getByLabel('Produktnamn')
    const priceFields = page.getByLabel('Pris (SEK)')
    await nameFields.nth(index).fill(product.name)
    await priceFields.nth(index).fill(product.price)
  }

  await page.getByRole('button', { name: 'Skapa kiosk' }).click()
  await page.waitForURL(
    (url) => {
      const { pathname } = new URL(url)
      return (
        /^\/admin\/[a-z0-9]+$/i.test(pathname) &&
        pathname !== '/admin/billing' &&
        pathname !== '/admin/skapa-kiosk' &&
        pathname !== '/admin/medlemmar'
      )
    },
    { timeout: 30_000 },
  )

  const shopAdminUrl = page.url()
  const shopIdMatch = shopAdminUrl.match(/\/admin\/([^/?#]+)/)
  const shopId = shopIdMatch?.[1]
  expect(shopId).toBeTruthy()

  return {
    shopId: shopId as string,
    publicUrl: `${baseURL}/s/${options.slug}`,
    kioskName,
  }
}

export async function createTrialOrgWithKiosk(
  page: Page,
  baseURL: string,
  options: {
    email: string
    orgName: string
    slug: string
    kioskName?: string
    products?: Array<{ name: string; price: string }>
  },
): Promise<CreateTestKioskResult & { orgName: string; email: string }> {
  await createTestOrg(page, {
    email: options.email,
    orgName: options.orgName,
  })

  const kiosk = await createTestKiosk(page, baseURL, {
    slug: options.slug,
    kioskName: options.kioskName,
    products: options.products,
  })

  return {
    ...kiosk,
    orgName: options.orgName,
    email: options.email,
  }
}
