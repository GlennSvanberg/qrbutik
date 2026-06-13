import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function readEnvLocal(key: string): string | undefined {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }
      const [name, ...rest] = trimmed.split('=')
      if (name.trim() === key) {
        return rest.join('=').trim()
      }
    }
  } catch {
    return undefined
  }
  return undefined
}

export function getConvexSiteUrl(): string {
  const fromEnv =
    process.env.PLAYWRIGHT_CONVEX_SITE_URL ??
    process.env.VITE_CONVEX_SITE_URL ??
    readEnvLocal('VITE_CONVEX_SITE_URL')

  if (!fromEnv) {
    throw new Error(
      'Set VITE_CONVEX_SITE_URL in .env.local or PLAYWRIGHT_CONVEX_SITE_URL for E2E tests.',
    )
  }

  return fromEnv.replace(/\/$/, '')
}

export function isStripeE2EEnabled(): boolean {
  return (
    process.env.STRIPE_E2E === 'true' ||
    readEnvLocal('STRIPE_E2E') === 'true'
  )
}

export function uniqueTestEmail(label: string): string {
  const slug = label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return `e2e+${slug}-${Date.now()}@qrbutik.test`
}

export function getTestBaseUrl(baseURL?: string): string {
  return (
    baseURL ??
    process.env.PLAYWRIGHT_BASE_URL ??
    readEnvLocal('VITE_SITE_URL') ??
    readEnvLocal('SITE_URL') ??
    'http://127.0.0.1:3000'
  )
}
