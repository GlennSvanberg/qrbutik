import { expect } from '@playwright/test'
import ExcelJS from 'exceljs'
import type { Download, Page } from '@playwright/test'

export const EXCEL_HEADERS = [
  'Datum',
  'Kiosk',
  'Belopp (kr)',
  'Referens',
  'Status',
  'Artiklar',
  'Antal rader',
] as const

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

export async function readDownloadBuffer(download: Download): Promise<Uint8Array> {
  const stream = await download.createReadStream()
  const chunks: Array<Uint8Array> = []
  for await (const chunk of stream) {
    chunks.push(new Uint8Array(chunk))
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const combined = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return combined
}

function cellValueToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'object') {
    if ('text' in value) {
      return String(value.text)
    }
    if ('result' in value) {
      return String(value.result)
    }
  }
  return String(value)
}

function getRowValues(row: ExcelJS.Row, columnCount: number): Array<string> {
  const values = Array.from({ length: columnCount }, () => '')

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= columnCount) {
      values[colNumber - 1] = cellValueToString(cell.value)
    }
  })

  return values
}

export async function parseExcelExport(data: Uint8Array): Promise<{
  headers: Array<string>
  rows: Array<Array<string>>
}> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(data as never)

  const sheet = workbook.getWorksheet('Transaktioner')
  expect(sheet).toBeTruthy()
  if (!sheet) {
    return { headers: [], rows: [] }
  }

  const headers = getRowValues(sheet.getRow(1), EXCEL_HEADERS.length)
  const rows: Array<Array<string>> = []

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const rowValues = getRowValues(sheet.getRow(rowNumber), EXCEL_HEADERS.length)
    if (rowValues[0] === 'Summa') {
      continue
    }
    if (rowValues.every((value) => value === '')) {
      continue
    }
    rows.push(rowValues)
  }

  return { headers, rows }
}

export function assertExcelExportHeaders(headers: Array<string>): void {
  expect(headers).toEqual([...EXCEL_HEADERS])
}

export function assertSieExportHeaders(content: string): void {
  for (const header of SIE_HEADERS) {
    expect(content).toContain(header)
  }
  expect(content).toContain('#TRANS')
}

async function downloadExportFile(
  page: Page,
  buttonLabel: 'Exportera Excel' | 'Exportera SIE',
  filenamePattern: RegExp,
  options?: { binary?: boolean },
): Promise<{ filename: string; content: string; buffer?: Uint8Array }> {
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

      if (options?.binary) {
        const buffer = await readDownloadBuffer(download)
        return {
          filename: download.suggestedFilename(),
          content: Buffer.from(buffer).toString('base64'),
          buffer,
        }
      }

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

export async function downloadExcelExport(page: Page): Promise<{
  filename: string
  content: string
  buffer: Uint8Array
  headers: Array<string>
  rows: Array<Array<string>>
}> {
  const result = await downloadExportFile(
    page,
    'Exportera Excel',
    /\.xlsx$/i,
    { binary: true },
  )
  expect(result.buffer).toBeTruthy()
  const parsed = await parseExcelExport(result.buffer!)
  return {
    filename: result.filename,
    content: result.content,
    buffer: result.buffer!,
    ...parsed,
  }
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
    page.getByRole('button', { name: 'Exportera Excel' }),
  ).toBeVisible()
}
