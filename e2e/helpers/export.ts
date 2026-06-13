import { expect } from '@playwright/test'
import type { Download, Page } from '@playwright/test'

export const CSV_HEADER =
  'Datum;Kiosk;Belopp;Referens;Status;Artiklar;Antal rader'

export const SIE_HEADERS = [
  '#FLAGGA 0',
  '#PROGRAM "QRButik"',
  '#FORMAT PC8',
  '#SIETYP 4',
] as const

export async function readDownloadText(download: Download): Promise<string> {
  const stream = await download.createReadStream()
  let text = ''
  for await (const chunk of stream) {
    text += chunk.toString()
  }
  return text
}

export function assertCsvExportHeaders(content: string): void {
  expect(content.startsWith('\uFEFF')).toBe(true)
  const firstLine = content.replace(/^\uFEFF/, '').split(/\r?\n/)[0]
  expect(firstLine).toBe(CSV_HEADER)
}

export function assertSieExportHeaders(content: string): void {
  for (const header of SIE_HEADERS) {
    expect(content).toContain(header)
  }
  expect(content).toContain('#TRANS')
}

async function downloadExportFile(
  page: Page,
  buttonLabel: 'Exportera CSV' | 'Exportera SIE',
  filenamePattern: RegExp,
): Promise<{ filename: string; content: string }> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await page.waitForTimeout(2500)
    }

    const downloadPromise = page.waitForEvent('download', { timeout: 45_000 })

    try {
      await page.getByRole('button', { name: buttonLabel }).click()
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(filenamePattern)
      const content = await readDownloadText(download)
      return {
        filename: download.suggestedFilename(),
        content,
      }
    } catch (error) {
      const alert = page.getByRole('alert')
      const alertText = (await alert.isVisible())
        ? await alert.textContent()
        : null

      if (alertText) {
        lastError = new Error(`${buttonLabel} failed: ${alertText}`)
        if (attempt < 2 && alertText.includes('Connection lost')) {
          continue
        }
        throw lastError
      }

      lastError =
        error instanceof Error ? error : new Error(`${buttonLabel} failed`)
      if (attempt === 2) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error(`${buttonLabel} failed`)
}

export async function downloadCsvExport(page: Page): Promise<{
  filename: string
  content: string
}> {
  return await downloadExportFile(page, 'Exportera CSV', /\.csv$/i)
}

export async function downloadSieExport(page: Page): Promise<{
  filename: string
  content: string
}> {
  return await downloadExportFile(page, 'Exportera SIE', /\.se$/i)
}

export async function openTreasurerExportPanel(
  page: Page,
  baseURL: string,
): Promise<void> {
  await page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded' })
  await page.waitForURL(/\/admin\/org\//, { timeout: 30_000 })
  await expect(
    page.getByRole('heading', { name: 'Centralt dashboard' }),
  ).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'All tid' }).click()
  await expect(
    page.getByRole('button', { name: 'Exportera CSV' }),
  ).toBeVisible()
}
