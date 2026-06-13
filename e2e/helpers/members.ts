import { expect } from '@playwright/test'
import { loginAndOpen } from './auth'
import { waitForDevInviteToken } from './invite'

import type { Page } from '@playwright/test'

export async function inviteMember(
  page: Page,
  baseURL: string,
  options: {
    email: string
    role: 'editor' | 'treasurer'
    organizationId?: string
    assignShopNames?: Array<string>
  },
): Promise<void> {
  const path = options.organizationId
    ? `/admin/medlemmar?organizationId=${options.organizationId}`
    : '/admin/medlemmar'

  await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('main h1', { hasText: 'Medlemmar' })).toBeVisible({
    timeout: 30_000,
  })

  await page.getByLabel('E-post').fill(options.email)
  await page.getByLabel('Roll').selectOption(options.role)

  if (options.role === 'editor' && options.assignShopNames) {
    for (const shopName of options.assignShopNames) {
      await page.getByRole('checkbox', { name: shopName }).check()
    }
  }

  await page.getByRole('button', { name: 'Skicka inbjudan' }).click()
  await expect(page.getByText('Inbjudan skickad.')).toBeVisible({
    timeout: 15_000,
  })
}

export async function acceptInviteAsUser(
  page: Page,
  email: string,
  baseURL: string,
): Promise<{ token: string; organizationId: string }> {
  const invite = await waitForDevInviteToken(email)
  await loginAndOpen(
    page,
    email,
    `/admin/medlemmar?invite=${invite.token}`,
    baseURL,
  )

  await expect(
    page.getByRole('button', { name: 'Acceptera inbjudan' }),
  ).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Acceptera inbjudan' }).click()
  await expect(page.getByText(/Du gick med i/)).toBeVisible({
    timeout: 15_000,
  })

  return invite
}
