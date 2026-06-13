import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readEnvLocal(key: string): string | undefined {
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

export default async function globalSetup() {
  const baseURL =
    process.env.PLAYWRIGHT_BASE_URL ??
    readEnvLocal('VITE_SITE_URL') ??
    readEnvLocal('SITE_URL') ??
    'http://127.0.0.1:3000'

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(baseURL)
      if (response.ok) {
        return
      }
    } catch {
      // Vite may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Dev server did not respond at ${baseURL}`)
}
