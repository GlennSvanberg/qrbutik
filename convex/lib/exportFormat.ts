export type ExportRow = {
  createdAt: number
  shopName: string
  shopSlug: string
  amount: number
  reference: string
  status: 'pending' | 'verified'
  itemsSummary: string
  itemCount: number
}

function formatCsvCell(value: string | number): string {
  const text = String(value)
  if (text.includes('"') || text.includes(';') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function formatDateSv(timestamp: number): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function formatDateSie(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export function buildItemsSummary(
  items: Array<{ name: string; price: number; quantity: number }>,
): string {
  return items
    .map((item) => `${item.quantity}x ${item.name} (${item.price} kr)`)
    .join(', ')
}

export function buildCsvExport(rows: Array<ExportRow>): string {
  const header = [
    'Datum',
    'Kiosk',
    'Belopp',
    'Referens',
    'Status',
    'Artiklar',
    'Antal rader',
  ]

  const lines = [
    header.join(';'),
    ...rows.map((row) =>
      [
        formatDateSv(row.createdAt),
        row.shopName,
        row.amount,
        row.reference,
        row.status === 'verified' ? 'Verifierad' : 'Väntande',
        row.itemsSummary,
        row.itemCount,
      ]
        .map(formatCsvCell)
        .join(';'),
    ),
  ]

  return `\uFEFF${lines.join('\r\n')}`
}

export function buildSieExport(args: {
  organizationName: string
  orgNumber?: string
  revenueAccount: string
  rows: Array<ExportRow>
}): string {
  const now = formatDateSie(Date.now())
  const orgNumber = args.orgNumber?.replace(/\D/g, '') || '0000000000'
  const lines = [
    '#FLAGGA 0',
    '#PROGRAM "QRButik"',
    '#FORMAT PC8',
    '#GEN ' + now,
    '#SIETYP 4',
    '#ORGNR ' + orgNumber,
    '#FNAMN "' + args.organizationName.replace(/"/g, '') + '"',
    '#KONTO ' + args.revenueAccount + ' "' + args.organizationName.replace(/"/g, '') + '"',
  ]

  for (const row of args.rows) {
    if (row.status !== 'verified') {
      continue
    }
    const transDate = formatDateSie(row.createdAt)
    const text = `${row.reference} (${row.shopName})`.replace(/"/g, '')
    lines.push(
      `#TRANS ${args.revenueAccount} {} ${row.amount.toFixed(2)} ${transDate} "${text}"`,
    )
  }

  return lines.join('\r\n')
}

export function buildExportFilename(args: {
  organizationName: string
  extension: 'csv' | 'se'
  start: number
  end: number
}): string {
  const start = formatDateSie(args.start)
  const end = formatDateSie(args.end)
  const slug = args.organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  return `qrbutik-${slug || 'export'}-${start}-${end}.${args.extension}`
}
