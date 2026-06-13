import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import { attachFindingsReporter } from './helpers/findings'
import { getTestBaseUrl, uniqueTestEmail } from './helpers/env'
import { acceptInviteAsUser, inviteMember } from './helpers/members'
import { createTestKiosk, createTestOrg } from './helpers/org'

attachFindingsReporter(test)

test.describe('Role-based navigation', () => {
  test('owner/treasurer sees Medlemmar, Fakturering, and export controls', async ({
    page,
    baseURL,
  }) => {
    const appUrl = getTestBaseUrl(baseURL)
    const email = uniqueTestEmail('roles-owner')
    const orgName = `E2E Roles Owner ${Date.now()}`
    const kioskSlug = `e2e-roles-owner-${Date.now()}`

    await loginAndOpen(page, email, '/skapa', appUrl)
    await createTestOrg(page, { email, orgName })
    const { shopId } = await createTestKiosk(page, appUrl, { slug: kioskSlug })

    await page.goto(`${appUrl}/admin`, { waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', { name: 'Centralt dashboard' }),
    ).toBeVisible({ timeout: 30_000 })

    await expect(page.getByRole('link', { name: 'Medlemmar' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Fakturering' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Exportera CSV' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Exportera SIE' }),
    ).toBeVisible()

    expect(shopId).toBeTruthy()
    await page.goto(`${appUrl}/admin/${shopId}`, {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.getByRole('link', { name: 'Köphistorik' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Inställningar' })).toBeVisible()
  })

  test('editor does not see treasurer-only nav or export controls', async ({
    browser,
    baseURL,
  }) => {
    const appUrl = getTestBaseUrl(baseURL)
    const ownerEmail = uniqueTestEmail('roles-owner-setup')
    const editorEmail = uniqueTestEmail('roles-editor')
    const orgName = `E2E Roles Editor ${Date.now()}`
    const kioskSlug = `e2e-roles-editor-${Date.now()}`
    const kioskName = 'Lagkiosk'

    const ownerContext = await browser.newContext()
    const editorContext = await browser.newContext()
    const ownerPage = await ownerContext.newPage()
    const editorPage = await editorContext.newPage()

    try {
      await loginAndOpen(ownerPage, ownerEmail, '/skapa', appUrl)
      await createTestOrg(ownerPage, { email: ownerEmail, orgName })
      await createTestKiosk(ownerPage, appUrl, {
        slug: kioskSlug,
        kioskName,
      })

      await inviteMember(ownerPage, appUrl, {
        email: editorEmail,
        role: 'editor',
        assignShopNames: [kioskName],
      })

      await acceptInviteAsUser(editorPage, editorEmail, appUrl)

      await editorPage.goto(`${appUrl}/admin`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(
        editorPage.getByRole('heading', { name: 'Dina kiosker' }),
      ).toBeVisible({ timeout: 30_000 })

      await expect(
        editorPage.getByRole('link', { name: 'Medlemmar' }),
      ).toHaveCount(0)
      await expect(
        editorPage.getByRole('link', { name: 'Fakturering' }),
      ).toHaveCount(0)
      await expect(
        editorPage.getByRole('button', { name: 'Exportera CSV' }),
      ).toHaveCount(0)
      await expect(
        editorPage.getByRole('button', { name: 'Exportera SIE' }),
      ).toHaveCount(0)

      await editorPage
        .getByRole('link', { name: 'Hantera kiosk' })
        .first()
        .click()

      await expect(
        editorPage.getByRole('link', { name: 'Försäljning' }),
      ).toBeVisible()
      await expect(
        editorPage.getByRole('link', { name: 'Produkter' }),
      ).toBeVisible()
      await expect(
        editorPage.getByRole('link', { name: 'Köphistorik' }),
      ).toHaveCount(0)
      await expect(
        editorPage.getByRole('link', { name: 'Inställningar' }),
      ).toHaveCount(0)
    } finally {
      await ownerContext.close()
      await editorContext.close()
    }
  })
})
