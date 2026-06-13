import { execSync } from 'node:child_process'

export default function globalTeardown() {
  try {
    execSync('npx convex run internal.testCleanup.cleanupE2eData', {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    })
  } catch (error) {
    console.warn(
      'E2E cleanup skipped or failed (non-fatal):',
      error instanceof Error ? error.message : error,
    )
  }
}
