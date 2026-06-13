import { execSync } from 'node:child_process'
import { readEnvLocal } from './helpers/env'

const E2E_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ??
  readEnvLocal('VITE_SITE_URL') ??
  readEnvLocal('SITE_URL') ??
  'http://127.0.0.1:3000'

async function probeDevMagicLinkRoute(convexSiteUrl: string): Promise<void> {
  const url = `${convexSiteUrl}/dev/magic-link?email=${encodeURIComponent('e2e-healthcheck@qrbutik.test')}`
  let response: Response

  try {
    response = await fetch(url)
  } catch (error) {
    throw new Error(
      `Cannot reach Convex site at ${convexSiteUrl}. Run \`npx convex dev\` and set VITE_CONVEX_SITE_URL in .env.local. ${error instanceof Error ? error.message : error}`,
    )
  }

  if (response.status === 404) {
    throw new Error(
      `Dev magic link route not found (404). Deploy convex/http.ts with \`npx convex dev\` and set DEV_MAGIC_LINK=true in Convex env.`,
    )
  }

  if (response.status !== 204 && !response.ok) {
    throw new Error(
      `Unexpected response from dev magic link probe: ${response.status} ${response.statusText}`,
    )
  }
}

export default async function globalSetup() {
  const convexSiteUrl =
    process.env.PLAYWRIGHT_CONVEX_SITE_URL ??
    process.env.VITE_CONVEX_SITE_URL ??
    readEnvLocal('VITE_CONVEX_SITE_URL')

  if (!convexSiteUrl) {
    throw new Error(
      'Set VITE_CONVEX_SITE_URL in .env.local or PLAYWRIGHT_CONVEX_SITE_URL for E2E tests.',
    )
  }

  await probeDevMagicLinkRoute(convexSiteUrl.replace(/\/$/, ''))

  try {
    execSync('npm run demo:seed', {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    })
  } catch (error) {
    console.warn(
      'demo:seed failed (non-fatal if demo shop already exists):',
      error instanceof Error ? error.message : error,
    )
  }

  console.log(`E2E global setup OK (base URL: ${E2E_BASE_URL})`)
}
