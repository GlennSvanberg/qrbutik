export type DashboardPeriod =
  | 'today'
  | 'yesterday'
  | 'weekend'
  | 'last7'
  | 'last30'
  | 'all'
  | 'custom'

export const dashboardPeriodOptions: Array<{
  id: DashboardPeriod
  label: string
}> = [
  { id: 'today', label: 'Idag' },
  { id: 'yesterday', label: 'Igår' },
  { id: 'weekend', label: 'Helgen' },
  { id: 'last7', label: '7 dagar' },
  { id: 'last30', label: '30 dagar' },
  { id: 'all', label: 'All tid' },
  { id: 'custom', label: 'Anpassat' },
]

export function getDateRangeForPeriod(
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string,
): { start: number; end: number } {
  const now = new Date()
  const end = now.getTime()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  ).getTime()
  const dayMs = 24 * 60 * 60 * 1000

  if (period === 'custom') {
    if (!customStart || !customEnd) {
      return { start: startOfToday, end }
    }
    const start = new Date(`${customStart}T00:00:00`).getTime()
    const customEndDate = new Date(`${customEnd}T23:59:59.999`).getTime()
    return { start, end: customEndDate }
  }

  if (period === 'today') {
    return { start: startOfToday, end }
  }

  if (period === 'yesterday') {
    const start = startOfToday - dayMs
    return { start, end: startOfToday - 1 }
  }

  if (period === 'weekend') {
    const day = now.getDay()
    if (day === 6) {
      return { start: startOfToday, end: startOfToday + 2 * dayMs - 1 }
    }
    if (day === 0) {
      return { start: startOfToday - dayMs, end: startOfToday + dayMs - 1 }
    }
    const daysSinceSaturday = (day + 1) % 7
    const lastSaturday = startOfToday - daysSinceSaturday * dayMs
    return {
      start: lastSaturday,
      end: lastSaturday + 2 * dayMs - 1,
    }
  }

  if (period === 'last7') {
    return { start: startOfToday - 6 * dayMs, end }
  }

  if (period === 'last30') {
    return { start: startOfToday - 29 * dayMs, end }
  }

  return { start: 0, end }
}

export function buildDashboardFilter(
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string,
) {
  if (period === 'custom') {
    const { start, end } = getDateRangeForPeriod(period, customStart, customEnd)
    return { kind: 'range' as const, start, end }
  }

  if (period === 'all') {
    return { kind: 'range' as const, start: 0, end: Date.now() }
  }

  return {
    kind: 'period' as const,
    period,
  }
}

export function downloadExportFile(args: {
  filename: string
  content: string
  mimeType: string
  encoding?: 'base64'
}) {
  const bytes =
    args.encoding === 'base64'
      ? Uint8Array.from(atob(args.content), (character) =>
          character.charCodeAt(0),
        )
      : new TextEncoder().encode(args.content)
  const blob = new Blob([bytes], { type: args.mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = args.filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function isTreasurerRole(role: 'owner' | 'treasurer' | 'editor') {
  return role === 'owner' || role === 'treasurer'
}
