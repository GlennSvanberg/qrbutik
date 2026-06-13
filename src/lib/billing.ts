export function daysUntil(
  timestamp: number | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (timestamp === undefined) {
    return null
  }

  const diff = timestamp - nowMs
  if (diff <= 0) {
    return 0
  }

  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}
