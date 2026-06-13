import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { attachFindingsReporter } from './helpers/findings'
import { getTestBaseUrl, uniqueTestEmail } from './helpers/env'
import { acceptInviteAsUser, inviteMember } from './helpers/members'
import { createTestKiosk, createTestOrg } from './helpers/org'

attachFindingsReporter(test)

test.describe('Member invitations', () => {
  test('owner invites editor and editor accepts via dev invite token', async ({
    page,
    browser,
    baseURL,
  }) => {
    test.setTimeout(180_000)
    const appUrl = getTestBaseUrl(baseURL)
    const ownerEmail = uniqueTestEmail('members-owner')
    const editorEmail = uniqueTestEmail('members-editor')
    const orgName = `E2E Members ${Date.now()}`
    const kioskSlug = `e2e-members-${Date.now()}`
    const kioskName = 'Cupkiosk'

    const editorContext = await browser.newContext({ baseURL: appUrl })
    const editorPage = await editorContext.newPage()

    try {
      await loginAndOpen(page, ownerEmail, '/skapa', appUrl)
      await createTestOrg(page, { email: ownerEmail, orgName })
      const { shopId } = await createTestKiosk(page, appUrl, {
        slug: kioskSlug,
        kioskName,
      })

      await inviteMember(page, appUrl, {
        email: editorEmail,
        role: 'editor',
        assignShopNames: [kioskName],
      })

      await expect(page.getByText(editorEmail, { exact: false })).toBeVisible({
        timeout: 15_000,
      })

      const invite = await acceptInviteAsUser(editorPage, editorEmail, appUrl)
      expect(invite.token.length).toBeGreaterThan(0)

      await editorPage.goto(`${appUrl}/admin`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(
        editorPage.getByRole('heading', { name: 'Dina kiosker' }),
      ).toBeVisible({ timeout: 30_000 })
      await expect(
        editorPage.getByRole('main').getByText(orgName),
      ).toBeVisible()

      await editorPage.goto(`${appUrl}/admin/${shopId}`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(editorPage.locator('main')).toBeVisible({ timeout: 30_000 })
    } finally {
      await editorContext.close()
    }
  })

  test('owner can reassign editor kiosker after invite', async ({
    page,
    browser,
    baseURL,
  }) => {
    test.setTimeout(180_000)
    const appUrl = getTestBaseUrl(baseURL)
    const ownerEmail = uniqueTestEmail('members-reassign-owner')
    const editorEmail = uniqueTestEmail('members-reassign-editor')
    const orgName = `E2E Reassign ${Date.now()}`
    const kioskA = 'Kiosk A'
    const kioskB = 'Kiosk B'

    const editorContext = await browser.newContext({ baseURL: appUrl })
    const editorPage = await editorContext.newPage()

    try {
      await loginAndOpen(page, ownerEmail, '/skapa', appUrl)
      await createTestOrg(page, { email: ownerEmail, orgName })
      await createTestKiosk(page, appUrl, {
        slug: `e2e-a-${Date.now()}`,
        kioskName: kioskA,
      })
      await createTestKiosk(page, appUrl, {
        slug: `e2e-b-${Date.now()}`,
        kioskName: kioskB,
      })

      await inviteMember(page, appUrl, {
        email: editorEmail,
        role: 'editor',
        assignShopNames: [kioskA],
      })

      await acceptInviteAsUser(editorPage, editorEmail, appUrl)

      await page.goto(`${appUrl}/admin/medlemmar`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(page.getByText(editorEmail)).toBeVisible({
        timeout: 15_000,
      })
      await page.getByRole('button', { name: 'Redigera' }).first().click()
      await page
        .getByRole('list')
        .getByRole('checkbox', { name: kioskB })
        .check()
      await page.getByRole('button', { name: 'Spara ändringar' }).click()
      await expect(page.getByText('Medlemmen uppdaterades.')).toBeVisible({
        timeout: 15_000,
      })
      await expect(page.getByText(`Kiosker: ${kioskA}, ${kioskB}`)).toBeVisible()
    } finally {
      await editorContext.close()
    }
  })
})
