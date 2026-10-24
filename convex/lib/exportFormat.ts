export type ExportRow = {
  createdAt: number
  shopName: string
  shopSlug: string
  amount: number
  reference: string
  status: 'pending' | 'verified'
  itemsSummary: string
  itemCount: number
  /** Inclusive VAT rate when known. Kiosk products do not store one. */
  vatRate?: 0 | 6 | 12 | 25
}

const SWISH_ACCOUNT = '1930'
const VAT_ACCOUNTS: Record<6 | 12 | 25, string> = {
  25: '2610',
  12: '2620',
  6: '2630',
}

const ACCOUNT_NAMES: Record<string, string> = {
  '1930': 'Företagskonto Swish',
  '2610': 'Utgående moms 25 %',
  '2620': 'Utgående moms 12 %',
  '2630': 'Utgående moms 6 %',
}

function stockholmParts(timestamp: number): { year: string; month: string; day: string; hour: string; minute: string } {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(timestamp))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  }
}

export function formatDateSie(timestamp: number): string {
  const parts = stockholmParts(timestamp)
  return `${parts.year}${parts.month}${parts.day}`
}

export function formatDateCsv(timestamp: number): string {
  const parts = stockholmParts(timestamp)
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

function sieQuote(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function money(value: number): string {
  return roundMoney(value).toFixed(2)
}

export function buildItemsSummary(
  items: Array<{ name: string; price: number; quantity: number }>,
): string {
  return items
    .map((item) => `${item.quantity}x ${item.name} (${item.price} kr)`)
    .join(', ')
}

function splitInclusive(amount: number, rate: 0 | 6 | 12 | 25): { net: number; vat: number } {
  if (rate === 0) {
    return { net: roundMoney(amount), vat: 0 }
  }
  const net = roundMoney(amount / (1 + rate / 100))
  return { net, vat: roundMoney(amount - net) }
}

export function buildSieExport(args: {
  organizationName: string
  orgNumber?: string
  revenueAccount: string
  rows: Array<ExportRow>
  periodStart?: number
  periodEnd?: number
  generatedAt?: number
}): string {
  const generatedAt = args.generatedAt ?? Date.now()
  const orgNumber = args.orgNumber?.replace(/\D/g, '') || '0000000000'
  const revenueAccount = args.revenueAccount.replace(/\D/g, '') || '3010'
  const verified = args.rows.filter((row) => row.status === 'verified')
  const periodStart =
    args.periodStart ??
    (verified.length > 0 ? verified[0].createdAt : generatedAt)
  const periodEnd =
    args.periodEnd ??
    (verified.length > 0 ? verified[verified.length - 1].createdAt : periodStart)

  const accounts = new Map<string, string>([
    [SWISH_ACCOUNT, ACCOUNT_NAMES[SWISH_ACCOUNT]],
    [revenueAccount, ACCOUNT_NAMES[revenueAccount] ?? 'Försäljning'],
  ])

  const verifications: Array<string> = []
  verified.forEach((row, index) => {
    const rate = row.vatRate ?? 0
    const { net, vat } = splitInclusive(row.amount, rate)
    const transDate = formatDateSie(row.createdAt)
    const text = sieQuote(`${row.reference} (${row.shopName})`)
    const lines = [
      `#VER "" ${index + 1} ${transDate} ${text} ${transDate}`,
      '{',
      `#TRANS ${SWISH_ACCOUNT} {} ${money(row.amount)}`,
      `#TRANS ${revenueAccount} {} ${money(-net)}`,
    ]
    if (rate !== 0 && vat !== 0) {
      const vatAccount = VAT_ACCOUNTS[rate]
      accounts.set(vatAccount, ACCOUNT_NAMES[vatAccount])
      lines.push(`#TRANS ${vatAccount} {} ${money(-vat)}`)
    }
    lines.push('}')
    verifications.push(lines.join('\r\n'))
  })

  const header = [
    '#FLAGGA 0',
    '#FORMAT PC8',
    '#SIETYP 4',
    '#PROGRAM "QRButik" 1.0',
    `#GEN ${formatDateSie(generatedAt)}`,
    `#FNAMN ${sieQuote(args.organizationName)}`,
    `#ORGNR ${orgNumber}`,
    `#RAR 0 ${formatDateSie(periodStart)} ${formatDateSie(periodEnd)}`,
    '#KPTYP EUBAS97',
    ...[...accounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([account, name]) => `#KONTO ${account} ${sieQuote(name)}`),
  ]

  return [...header, ...verifications].join('\r\n') + '\r\n'
}

const CP437_EXTRA: Record<string, number> = {
  'Ç': 0x80, 'ü': 0x81, 'é': 0x82, 'â': 0x83, 'ä': 0x84, 'à': 0x85, 'å': 0x86,
  'ç': 0x87, 'ê': 0x88, 'ë': 0x89, 'è': 0x8a, 'ï': 0x8b, 'î': 0x8c, 'ì': 0x8d,
  'Ä': 0x8e, 'Å': 0x8f, 'É': 0x90, 'æ': 0x91, 'Æ': 0x92, 'ô': 0x93, 'ö': 0x94,
  'ò': 0x95, 'û': 0x96, 'ù': 0x97, 'ÿ': 0x98, 'Ö': 0x99, 'Ü': 0x9a, 'ø': 0x9b,
  '£': 0x9c, 'Ø': 0x9d, '×': 0x9e, 'ƒ': 0x9f, 'á': 0xa0, 'í': 0xa1, 'ó': 0xa2,
  'ú': 0xa3, 'ñ': 0xa4, 'Ñ': 0xa5, 'ª': 0xa6, 'º': 0xa7, '¿': 0xa8, '®': 0xa9,
  '¬': 0xaa, '½': 0xab, '¼': 0xac, '¡': 0xad, '«': 0xae, '»': 0xaf,
}

export function encodePc8(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length)
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? '?'
    const code = char.codePointAt(0) ?? 63
    if (code < 128) {
      bytes[index] = code
      continue
    }
    bytes[index] = CP437_EXTRA[char] ?? 63
  }
  return bytes
}

export function decodePc8(bytes: Uint8Array): string {
  const reverse = new Map(Object.entries(CP437_EXTRA).map(([char, code]) => [code, char]))
  let text = ''
  for (const byte of bytes) {
    text += byte < 128 ? String.fromCharCode(byte) : (reverse.get(byte) ?? '?')
  }
  return text
}

const CSV_HEADERS = [
  'Datum',
  'Kiosk',
  'Belopp (kr)',
  'Referens',
  'Status',
  'Artiklar',
  'Antal rader',
] as const

function csvField(value: string): string {
  if (/[;"\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function statusLabel(status: ExportRow['status']): string {
  return status === 'verified' ? 'Verifierad' : 'Väntande'
}

export function buildCsvExport(rows: Array<ExportRow>): string {
  const lines = [
    CSV_HEADERS.join(';'),
    ...rows.map((row) =>
      [
        formatDateCsv(row.createdAt),
        row.shopName,
        money(row.amount).replace('.', ','),
        row.reference,
        statusLabel(row.status),
        row.itemsSummary,
        String(row.itemCount),
      ]
        .map(csvField)
        .join(';'),
    ),
  ]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function buildExportFilename(args: {
  organizationName: string
  extension: 'xlsx' | 'se' | 'csv'
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
