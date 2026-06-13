import { expect } from '@playwright/test'
import { getConvexSiteUrl } from './env'
import type { Page } from '@playwright/test'

async function waitForDevMagicLink(
  convexSiteUrl: string,
  email: string,
): Promise<string> {
  const maxAttempts = 30
  const delayMs = 500

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(
      `${convexSiteUrl}/dev/magic-link?email=${encodeURIComponent(email)}`,
    )

    if (response.status === 204) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      continue
    }

    if (response.ok) {
      const payload = (await response.json()) as { url?: string }
      if (payload.url) {
        return payload.url
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  throw new Error(
    `Dev magic link not found for ${email}. Ensure DEV_MAGIC_LINK=true in Convex env.`,
  )
}

async function waitForAuthenticatedDestination(
  page: Page,
  redirectTo: string,
): Promise<void> {
  const path = redirectTo.split('?')[0] ?? redirectTo

  if (path.includes('/skapa')) {
    await expect(page.getByLabel('Föreningsnamn')).toBeVisible({
      timeout: 30_000,
    })
    return
  }

  if (path.includes('/admin/billing')) {
    await expect(
      page.getByRole('heading', { name: 'Klubblicens & fakturering' }),
    ).toBeVisible({ timeout: 30_000 })
    return
  }

  if (path.includes('/admin')) {
    await expect(
      page.getByRole('heading', {
        name: /Centralt dashboard|Dina kiosker|Föreningens kiosker/,
      }),
    ).toBeVisible({ timeout: 30_000 })
    return
  }

  await expect(
    page.getByRole('heading', { name: 'Föreningens kiosker' }),
  ).toBeVisible({ timeout: 30_000 })
}

async function completeMagicLinkVerification(
  page: Page,
  magicLinkUrl: string,
  appBaseUrl: string,
  redirectTo: string,
): Promise<void> {
  await page.goto(magicLinkUrl, { waitUntil: 'domcontentloaded' }).catch(() => {
    // Redirect during verify aborts navigation — session may still be established.
  })

  const destination = redirectTo.startsWith('http')
    ? redirectTo
    : new URL(redirectTo, appBaseUrl).toString()
  const destinationPath = new URL(destination).pathname

  if (!new URL(page.url()).pathname.startsWith(destinationPath)) {
    await page.goto(destination, { waitUntil: 'domcontentloaded' })
  }

  await waitForAuthenticatedDestination(page, redirectTo)
}

export async function loginWithDevMagicLink(
  page: Page,
  email: string,
  redirectTo = '/admin',
  appBaseUrl = 'http://localhost:3000',
): Promise<void> {
  const convexSiteUrl = getConvexSiteUrl()

  await page.goto(`/logga-in?redirect=${encodeURIComponent(redirectTo)}`)
  await page.getByLabel('E-post').fill(email)
  await page.getByRole('button', { name: 'Skicka inloggningslänk' }).click()

  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const magicLinkUrl = await waitForDevMagicLink(convexSiteUrl, email)
      await completeMagicLinkVerification(
        page,
        magicLinkUrl,
        appBaseUrl,
        redirectTo,
      )
      return
    } catch (error) {
      lastError = error
      if (attempt === 0) {
        await page.goto(`/logga-in?redirect=${encodeURIComponent(redirectTo)}`)
        await page.getByLabel('E-post').fill(email)
        await page.getByRole('button', { name: 'Skicka inloggningslänk' }).click()
      }
    }
  }

  throw lastError
}

/** Log in via /admin, then open another protected route if needed. */
export async function loginAndOpen(
  page: Page,
  email: string,
  path: string,
  appBaseUrl = 'http://localhost:3000',
): Promise<void> {
  const normalizedPath = path.split('?')[0] ?? path

  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
    await loginWithDevMagicLink(page, email, path, appBaseUrl)
    return
  }

  await loginWithDevMagicLink(page, email, '/admin', appBaseUrl)
  await page.goto(
    path.startsWith('http') ? path : new URL(path, appBaseUrl).toString(),
    { waitUntil: 'domcontentloaded' },
  )
  await waitForAuthenticatedDestination(page, path)
}
