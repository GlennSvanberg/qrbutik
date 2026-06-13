import { describe, expect, it } from 'vitest'
import {
  buildCsvExport,
  buildExportFilename,
  buildItemsSummary,
  buildSieExport,
} from './exportFormat'

describe('exportFormat', () => {
  const sampleRows = [
    {
      createdAt: new Date('2025-06-14T12:00:00').getTime(),
      shopName: 'Cup-kiosken',
      shopSlug: 'cup-kiosken',
      amount: 120,
      reference: 'ABC123',
      status: 'verified' as const,
      itemsSummary: '2x Korv (60 kr)',
      itemCount: 2,
    },
  ]

  it('builds item summary text', () => {
    expect(
      buildItemsSummary([
        { name: 'Korv', price: 60, quantity: 2 },
        { name: 'Läsk', price: 20, quantity: 1 },
      ]),
    ).toBe('2x Korv (60 kr), 1x Läsk (20 kr)')
  })

  it('builds CSV with BOM and semicolon delimiter', () => {
    const csv = buildCsvExport(sampleRows)
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('Cup-kiosken')
    expect(csv).toContain('Verifierad')
  })

  it('builds minimal SIE4 export', () => {
    const sie = buildSieExport({
      organizationName: 'Test IF',
      orgNumber: '556677-8899',
      revenueAccount: '3010',
      rows: sampleRows,
    })
    expect(sie).toContain('#SIETYP 4')
    expect(sie).toContain('#ORGNR 5566778899')
    expect(sie).toContain('#TRANS 3010')
  })

  it('builds export filename', () => {
    const filename = buildExportFilename({
      organizationName: 'Test IF',
      extension: 'csv',
      start: new Date('2025-06-14').getTime(),
      end: new Date('2025-06-15').getTime(),
    })
    expect(filename).toMatch(/^qrbutik-test-if-.*\.csv$/)
  })
})
