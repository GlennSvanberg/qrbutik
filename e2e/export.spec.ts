import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { uniqueTestEmail } from './helpers/env'

test.describe('Treasurer export', () => {
  test('trial org can sell, verify, and export CSV/SIE', async ({
    page,
    baseURL,
  }) => {
    const email = uniqueTestEmail('export')
    const orgName = `E2E Export ${Date.now()}`
    const kioskSlug = `e2e-export-${Date.now()}`
    const productName = 'Korv med bröd'

    await loginAndOpen(page, email, '/skapa', baseURL)

    await page.getByLabel('Föreningsnamn').fill(orgName)
    await page.getByLabel('Faktura-e-post').fill(email)
    await page.getByRole('button', { name: 'Skapa förening' }).click()
    await page.waitForURL(/\/admin\/billing/, { timeout: 30_000 })

    await page.goto(`${baseURL}/admin/skapa-kiosk`)
    await expect(
      page.getByRole('heading', { name: 'Skapa kiosk' }),
    ).toBeVisible({ timeout: 30_000 })

    await page.getByLabel('Kiosknamn').fill('Cupkiosk')
    await page.getByLabel('Swish-nummer').fill('1234567890')
    await page.getByLabel('Kioskens webbadress (slug)').fill(kioskSlug)
    await expect(page.getByText('Adressen är ledig.')).toBeVisible({
      timeout: 15_000,
    })

    await page.getByLabel('Produktnamn').fill(productName)
    await page.getByLabel('Pris (SEK)').fill('25')
    await page.getByRole('button', { name: 'Skapa kiosk' }).click()
    await page.waitForURL(/\/admin\/[^/]+$/, { timeout: 30_000 })

    const shopAdminUrl = page.url()
    const shopIdMatch = shopAdminUrl.match(/\/admin\/([^/?#]+)/)
    expect(shopIdMatch?.[1]).toBeTruthy()
    const shopId = shopIdMatch![1]

    await page.goto(`${baseURL}/s/${kioskSlug}`)
    await expect(page.getByRole('heading', { name: 'Cupkiosk' })).toBeVisible({
      timeout: 30_000,
    })

    await page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Produkter' }) })
      .getByRole('button')
      .last()
      .click()
    await expect(page.getByText('Totalt att betala:')).toBeVisible()
    await page.getByRole('button', { name: 'Betala med Swish' }).click()
    await page.waitForURL(/\/tack\//, { timeout: 20_000 })

    await page.goto(`${baseURL}/admin/${shopId}/historik`)
    await expect(
      page.getByRole('heading', { name: 'Alla köp' }),
    ).toBeVisible({ timeout: 30_000 })

    const pendingCheckbox = page.locator('input[type="checkbox"]:not(:checked)').first()
    await expect(pendingCheckbox).toBeVisible({ timeout: 15_000 })
    await pendingCheckbox.check()
    await expect(page.getByText('Betalning verifierad.')).toBeVisible({
      timeout: 15_000,
    })

    await page.goto(`${baseURL}/admin`)
    await expect(
      page.getByRole('heading', { name: 'Centralt dashboard' }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(
      page.getByRole('button', { name: 'Exportera CSV' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Exportera SIE' }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'All tid' }).click()

    const csvDownloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Exportera CSV' }).click()
    const csvDownload = await csvDownloadPromise
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/i)
    const csvPath = await csvDownload.path()
    expect(csvPath).toBeTruthy()
    const csvContent = await csvDownload.createReadStream()
    let csvText = ''
    if (csvContent) {
      for await (const chunk of csvContent) {
        csvText += chunk.toString()
      }
    }
    expect(csvText).toContain(productName)
    expect(csvText).toContain('25')

    const sieDownloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Exportera SIE' }).click()
    const sieDownload = await sieDownloadPromise
    expect(sieDownload.suggestedFilename()).toMatch(/\.se$/i)
    const sieStream = await sieDownload.createReadStream()
    let sieText = ''
    if (sieStream) {
      for await (const chunk of sieStream) {
        sieText += chunk.toString()
      }
    }
    expect(sieText).toContain('#FLAGGA 0')
    expect(sieText).toContain('#TRANS')
  })
})
