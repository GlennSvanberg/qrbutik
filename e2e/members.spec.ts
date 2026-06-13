import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { attachFindingsReporter } from './helpers/findings'
import { getTestBaseUrl, uniqueTestEmail } from './helpers/env'
import { acceptInviteAsUser, inviteMember } from './helpers/members'
import { createTestKiosk, createTestOrg } from './helpers/org'

attachFindingsReporter(test)

test.describe('Member invitations', () => {
  test('owner invites editor and editor accepts via dev invite token', async ({
    browser,
    baseURL,
  }) => {
    const appUrl = getTestBaseUrl(baseURL)
    const ownerEmail = uniqueTestEmail('members-owner')
    const editorEmail = uniqueTestEmail('members-editor')
    const orgName = `E2E Members ${Date.now()}`
    const kioskSlug = `e2e-members-${Date.now()}`
    const kioskName = 'Cupkiosk'

    const ownerContext = await browser.newContext()
    const editorContext = await browser.newContext()
    const ownerPage = await ownerContext.newPage()
    const editorPage = await editorContext.newPage()

    try {
      await loginAndOpen(ownerPage, ownerEmail, '/skapa', appUrl)
      await createTestOrg(ownerPage, { email: ownerEmail, orgName })
      const { shopId } = await createTestKiosk(ownerPage, appUrl, {
        slug: kioskSlug,
        kioskName,
      })

      await inviteMember(ownerPage, appUrl, {
        email: editorEmail,
        role: 'editor',
        assignShopNames: [kioskName],
      })

      await expect(
        ownerPage.getByText(editorEmail, { exact: false }),
      ).toBeVisible({ timeout: 15_000 })

      const invite = await acceptInviteAsUser(editorPage, editorEmail, appUrl)
      expect(invite.token.length).toBeGreaterThan(0)

      await editorPage.goto(`${appUrl}/admin`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(
        editorPage.getByRole('heading', { name: 'Dina kiosker' }),
      ).toBeVisible({ timeout: 30_000 })
      await expect(editorPage.getByText(orgName)).toBeVisible()

      await editorPage.goto(`${appUrl}/admin/${shopId}`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(editorPage.locator('main')).toBeVisible({ timeout: 30_000 })
    } finally {
      await ownerContext.close()
      await editorContext.close()
    }
  })

  test('owner can reassign editor kiosker after invite', async ({
    browser,
    baseURL,
  }) => {
    const appUrl = getTestBaseUrl(baseURL)
    const ownerEmail = uniqueTestEmail('members-reassign-owner')
    const editorEmail = uniqueTestEmail('members-reassign-editor')
    const orgName = `E2E Reassign ${Date.now()}`
    const kioskA = 'Kiosk A'
    const kioskB = 'Kiosk B'

    const ownerContext = await browser.newContext()
    const ownerPage = await ownerContext.newPage()

    try {
      await loginAndOpen(ownerPage, ownerEmail, '/skapa', appUrl)
      await createTestOrg(ownerPage, { email: ownerEmail, orgName })
      await createTestKiosk(ownerPage, appUrl, {
        slug: `e2e-a-${Date.now()}`,
        kioskName: kioskA,
      })
      await createTestKiosk(ownerPage, appUrl, {
        slug: `e2e-b-${Date.now()}`,
        kioskName: kioskB,
      })

      await inviteMember(ownerPage, appUrl, {
        email: editorEmail,
        role: 'editor',
        assignShopNames: [kioskA],
      })

      await ownerPage.goto(`${appUrl}/admin/medlemmar`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(ownerPage.getByText(editorEmail)).toBeVisible({
        timeout: 15_000,
      })
      await ownerPage.getByRole('button', { name: 'Redigera' }).first().click()
      await ownerPage.getByRole('checkbox', { name: kioskB }).check()
      await ownerPage.getByRole('button', { name: 'Spara ändringar' }).click()
      await expect(ownerPage.getByText('Medlemmen uppdaterades.')).toBeVisible({
        timeout: 15_000,
      })
      await expect(ownerPage.getByText(/Kiosker:/)).toBeVisible()
      await expect(ownerPage.getByText(kioskA)).toBeVisible()
      await expect(ownerPage.getByText(kioskB)).toBeVisible()
    } finally {
      await ownerContext.close()
    }
  })
})
