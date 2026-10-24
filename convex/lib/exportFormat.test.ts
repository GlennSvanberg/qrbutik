import { describe, expect, it } from 'vitest'
import { buildExcelExport } from './buildExcelExport'
import {
  buildCsvExport,
  buildExportFilename,
  buildItemsSummary,
  buildSieExport,
  decodePc8,
  encodePc8,
  type ExportRow,
} from './exportFormat'

const generatedAt = new Date('2026-10-24T10:00:00+02:00').getTime()

function row(overrides: Partial<ExportRow> = {}): ExportRow {
  return {
    createdAt: new Date('2026-06-14T14:30:00+02:00').getTime(),
    shopName: 'Cupkiosk',
    shopSlug: 'cupkiosk',
    amount: 125,
    reference: 'ABC123',
    status: 'verified',
    itemsSummary: '1x Korv med bröd (25 kr)',
    itemCount: 1,
    ...overrides,
  }
}

function transAmounts(sie: string): Array<{ account: string; amount: number }> {
  return sie
    .split(/\r\n/)
    .filter((line) => line.startsWith('#TRANS'))
    .map((line) => {
      const match = line.match(/^#TRANS (\d+) \{\} (-?\d+\.\d{2})$/)
      if (!match) {
        throw new Error(`Bad TRANS line: ${line}`)
      }
      return { account: match[1], amount: Number(match[2]) }
    })
}

describe('exportFormat', () => {
  it('builds item summary text', () => {
    expect(
      buildItemsSummary([
        { name: 'Korv', price: 60, quantity: 2 },
        { name: 'Läsk', price: 20, quantity: 1 },
      ]),
    ).toBe('2x Korv (60 kr), 1x Läsk (20 kr)')
  })

  it('builds formatted Excel export', async () => {
    const buffer = await buildExcelExport([row()])
    expect(buffer.length).toBeGreaterThan(1000)
    expect(buffer.subarray(0, 2).toString()).toBe('PK')
  })

  it('builds a balanced SIE4 file with required posts and PC8 bytes', () => {
    const rows = [
      row({
        amount: 125,
        vatRate: 25,
        itemsSummary: '2x Köttbullar (50 kr), 1x Läsk (25 kr)',
        reference: 'REF-ÅÄÖ',
        shopName: 'Kiosk Åäö',
      }),
      row({
        createdAt: new Date('2026-06-14T15:00:00+02:00').getTime(),
        amount: 56,
        vatRate: 12,
        reference: 'LUNCH',
        itemsSummary: '1x Smörgås (56 kr)',
      }),
      row({
        createdAt: new Date('2026-06-14T15:10:00+02:00').getTime(),
        amount: 21.2,
        vatRate: 6,
        reference: 'TIDNING',
        itemsSummary: '1x Tidning (21,20 kr)',
      }),
      row({
        createdAt: new Date('2026-06-14T15:20:00+02:00').getTime(),
        amount: 15,
        vatRate: 0,
        reference: 'VATTEN',
        itemsSummary: '1x Vatten (15 kr)',
      }),
      row({
        createdAt: new Date('2026-06-14T16:00:00+02:00').getTime(),
        amount: -25,
        vatRate: 25,
        reference: 'RETUR',
        itemsSummary: '1x Korv med bröd (25 kr)',
      }),
      row({ status: 'pending', amount: 99, reference: 'VAXTE' }),
    ]

    const sie = buildSieExport({
      organizationName: 'Föreningen "Åäö"',
      orgNumber: '802012-3456',
      revenueAccount: '3010',
      rows,
      periodStart: new Date('2026-06-01T00:00:00+02:00').getTime(),
      periodEnd: new Date('2026-06-30T23:59:00+02:00').getTime(),
      generatedAt,
    })

    expect(sie.endsWith('\r\n')).toBe(true)
    expect(sie).not.toMatch(/[^\r]\n/)
    for (const post of [
      '#FLAGGA 0',
      '#FORMAT PC8',
      '#SIETYP 4',
      '#PROGRAM "QRButik" 1.0',
      '#GEN 20261024',
      '#FNAMN "Föreningen ""Åäö"""',
      '#ORGNR 8020123456',
      '#RAR 0 20260601 20260630',
      '#KPTYP EUBAS97',
      '#KONTO 1930 "Företagskonto Swish"',
      '#KONTO 2610 "Utgående moms 25 %"',
      '#KONTO 2620 "Utgående moms 12 %"',
      '#KONTO 2630 "Utgående moms 6 %"',
      '#KONTO 3010 "Försäljning"',
    ]) {
      expect(sie).toContain(post)
    }
    expect(sie).not.toContain('VAXTE')

    const versions = sie.split(/\r\n/).filter((line) => line.startsWith('#VER'))
    expect(versions).toHaveLength(5)
    expect(versions[0]).toContain('20260614')
    expect(versions[0]).toContain('"REF-ÅÄÖ (Kiosk Åäö)"')

    const byVerification = sie.split(/\r\n#VER /).slice(1)
    for (const verification of byVerification) {
      const sum = transAmounts(`#VER ${verification}`).reduce(
        (total, line) => total + line.amount,
        0,
      )
      expect(Math.abs(sum)).toBeLessThan(0.001)
    }

    const accounts = new Set(
      transAmounts(sie).map((line) => line.account),
    )
    expect(accounts).toEqual(new Set(['1930', '2610', '2620', '2630', '3010']))

    const decoded = decodePc8(encodePc8(sie))
    expect(decoded).toBe(sie)
    expect(encodePc8('åäöÅÄÖ')[0]).toBe(0x86)
  })

  it('writes an empty SIE period without verifications', () => {
    const sie = buildSieExport({
      organizationName: 'Tom IF',
      orgNumber: '5566778899',
      revenueAccount: '3010',
      rows: [],
      periodStart: new Date('2026-01-01T00:00:00+01:00').getTime(),
      periodEnd: new Date('2026-01-31T00:00:00+01:00').getTime(),
      generatedAt,
    })
    expect(sie).toContain('#RAR 0 20260101 20260131')
    expect(sie).not.toContain('#VER')
    expect(sie).not.toContain('#TRANS')
    expect(sie).toContain('#KONTO 1930')
    expect(sie).toContain('#KONTO 3010')
  })

  it('books the full amount to sales when no VAT rate is stored', () => {
    const sie = buildSieExport({
      organizationName: 'Test IF',
      orgNumber: '556677-8899',
      revenueAccount: '3050',
      rows: [row({ amount: 100, vatRate: undefined })],
      generatedAt,
    })
    expect(sie).toContain('#ORGNR 5566778899')
    expect(sie).toContain('#KONTO 3050 "Försäljning"')
    expect(sie).not.toContain('#KONTO 2610')
    const amounts = transAmounts(sie)
    expect(amounts).toEqual([
      { account: '1930', amount: 100 },
      { account: '3050', amount: -100 },
    ])
  })

  it('builds a Swedish CSV with BOM, semicolon and escaped fields', () => {
    const csv = buildCsvExport([
      row({
        shopName: 'Kiosk; "Åäö"',
        amount: 12.5,
        itemsSummary: '1x Smörgås (12,50 kr)',
        reference: 'ÅÄÖ-1',
      }),
      row({ status: 'pending', amount: 0, reference: 'TOM', itemsSummary: '' }),
    ])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('\r\n')
    const lines = csv.replace(/^\uFEFF/, '').trim().split('\r\n')
    expect(lines[0]).toBe(
      'Datum;Kiosk;Belopp (kr);Referens;Status;Artiklar;Antal rader',
    )
    expect(lines[1]).toContain('2026-06-14 14:30')
    expect(lines[1]).toContain('"Kiosk; ""Åäö"""')
    expect(lines[1]).toContain('12,50')
    expect(lines[1]).toContain('Verifierad')
    expect(lines[2]).toContain('Väntande')
    expect(lines[2]).toContain('0,00')
  })

  it('writes a header-only CSV for an empty period', () => {
    const csv = buildCsvExport([])
    const lines = csv.replace(/^\uFEFF/, '').trim().split('\r\n')
    expect(lines).toHaveLength(1)
    expect(lines[0].startsWith('Datum;')).toBe(true)
  })

  it('builds export filename', () => {
    const filename = buildExportFilename({
      organizationName: 'Test IF',
      extension: 'csv',
      start: new Date('2025-06-14T12:00:00+02:00').getTime(),
      end: new Date('2025-06-15T12:00:00+02:00').getTime(),
    })
    expect(filename).toMatch(/^qrbutik-test-if-20250614-20250615\.csv$/)
  })
})
