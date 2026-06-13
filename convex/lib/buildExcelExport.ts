'use node'

import ExcelJS from 'exceljs'
import type { ExportRow } from './exportFormat'

const COLUMN_COUNT = 7

const HEADERS = [
  'Datum',
  'Kiosk',
  'Belopp (kr)',
  'Referens',
  'Status',
  'Artiklar',
  'Antal rader',
] as const

const MIN_COLUMN_WIDTHS = [18, 20, 14, 16, 14, 36, 12]

function statusLabel(status: ExportRow['status']): string {
  return status === 'verified' ? 'Verifierad' : 'Väntande'
}

function autoFitColumns(sheet: ExcelJS.Worksheet) {
  for (let col = 1; col <= COLUMN_COUNT; col += 1) {
    const column = sheet.getColumn(col)
    let maxLength = MIN_COLUMN_WIDTHS[col - 1] ?? 12

    column.eachCell({ includeEmpty: false }, (cell) => {
      const value =
        cell.value instanceof Date
          ? cell.value.toLocaleString('sv-SE')
          : String(cell.value ?? '')
      maxLength = Math.max(maxLength, Math.min(value.length + 2, 60))
    })

    column.width = maxLength
  }
}

export async function buildExcelExport(rows: Array<ExportRow>): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'QRButik'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Transaktioner', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  const tableRows = rows.map((row) => [
    new Date(row.createdAt),
    row.shopName,
    row.amount,
    row.reference,
    statusLabel(row.status),
    row.itemsSummary,
    row.itemCount,
  ])

  sheet.addTable({
    name: 'QRButikTransaktioner',
    ref: rows.length > 0 ? `A1:G${rows.length + 1}` : 'A1:G1',
    headerRow: true,
    totalsRow: rows.length > 0,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true,
    },
    columns: [
      { name: HEADERS[0], totalsRowLabel: 'Summa', filterButton: true },
      { name: HEADERS[1], filterButton: true },
      {
        name: HEADERS[2],
        filterButton: true,
        totalsRowFunction: rows.length > 0 ? 'sum' : undefined,
      },
      { name: HEADERS[3], filterButton: true },
      { name: HEADERS[4], filterButton: true },
      { name: HEADERS[5], filterButton: true },
      {
        name: HEADERS[6],
        filterButton: true,
        totalsRowFunction: rows.length > 0 ? 'sum' : undefined,
      },
    ],
    rows: tableRows,
  })

  sheet.getColumn(1).numFmt = 'yyyy-mm-dd hh:mm'
  sheet.getColumn(3).numFmt = '#,##0 "kr"'
  sheet.getColumn(7).numFmt = '0'

  for (let rowIndex = 2; rowIndex <= rows.length + 1; rowIndex += 1) {
    sheet.getRow(rowIndex).alignment = { vertical: 'top', wrapText: true }
  }

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F3D5C' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' }
  headerRow.height = 24

  autoFitColumns(sheet)

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
