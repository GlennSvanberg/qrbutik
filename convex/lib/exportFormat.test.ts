import { describe, expect, it } from 'vitest'
import { buildExcelExport } from './buildExcelExport'
import {
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

  it('builds formatted Excel export', async () => {
    const buffer = await buildExcelExport(sampleRows)
    expect(buffer.length).toBeGreaterThan(1000)
    expect(buffer.subarray(0, 2).toString()).toBe('PK')
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
      extension: 'xlsx',
      start: new Date('2025-06-14').getTime(),
      end: new Date('2025-06-15').getTime(),
    })
    expect(filename).toMatch(/^qrbutik-test-if-.*\.xlsx$/)
  })

  it('SIE excludes pending transactions from TRANS lines', () => {
    const rows = [
      {
        ...sampleRows[0],
        status: 'verified' as const,
        amount: 100,
        reference: 'VER-1',
      },
      {
        ...sampleRows[0],
        status: 'pending' as const,
        amount: 50,
        reference: 'PEND-1',
      },
    ]

    const sie = buildSieExport({
      organizationName: 'Test IF',
      orgNumber: '556677-8899',
      revenueAccount: '3010',
      rows,
    })

    const transLines = sie.split('\n').filter((line) => line.startsWith('#TRANS'))
    expect(transLines).toHaveLength(1)
    expect(transLines[0]).toContain('100.00')
    expect(transLines[0]).not.toContain('PEND-1')
  })

  it('SIE strips non-digits from org number', () => {
    const sie = buildSieExport({
      organizationName: 'Test IF',
      orgNumber: '55 66-77/8899',
      revenueAccount: '3010',
      rows: sampleRows,
    })
    expect(sie).toContain('#ORGNR 5566778899')
  })

  it('SIE uses custom revenue account', () => {
    const sie = buildSieExport({
      organizationName: 'Test IF',
      orgNumber: '5566778899',
      revenueAccount: '3050',
      rows: sampleRows,
    })
    expect(sie).toContain('#TRANS 3050')
    expect(sie).toContain('#KONTO 3050')
  })
})
