import { expect, test } from '@playwright/test'
import { loginAndOpen } from './helpers/auth'
import {
  assertCsvExportHeaders,
  assertSieExportHeaders,
  downloadCsvExport,
  downloadSieExport,
  openTreasurerExportPanel,
} from './helpers/export'
import { attachFindingsReporter } from './helpers/findings'
import { getTestBaseUrl, uniqueTestEmail } from './helpers/env'
import { createTrialOrgWithKiosk } from './helpers/org'
import {
  purchaseProductOnKiosk,
  verifyFirstPendingPayment,
} from './helpers/purchase'

attachFindingsReporter(test)

test.describe('ROADMAP 5.4 — trial to export', () => {
  test('trial org → skapa-kiosk → customer purchase → verify → export download', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(180_000)
    const appUrl = getTestBaseUrl(baseURL)
    const email = uniqueTestEmail('roadmap-5-4')
    const orgName = `E2E Roadmap 5.4 ${Date.now()}`
    const kioskSlug = `e2e-r54-${Date.now()}`
    const productName = 'Korv med bröd'

    await loginAndOpen(page, email, '/skapa', appUrl)

    const { shopId, kioskName } = await createTrialOrgWithKiosk(page, appUrl, {
      email,
      orgName,
      slug: kioskSlug,
      kioskName: 'Cupkiosk',
      products: [{ name: productName, price: '25' }],
    })

    await purchaseProductOnKiosk(page, appUrl, kioskSlug, {
      kioskHeading: kioskName,
    })

    await verifyFirstPendingPayment(page, appUrl, shopId)

    await openTreasurerExportPanel(page, appUrl)

    const csv = await downloadCsvExport(page)
    assertCsvExportHeaders(csv.content)
    expect(csv.content).toContain(productName)
    expect(csv.content).toContain('25')

    const sie = await downloadSieExport(page)
    assertSieExportHeaders(sie.content)
    expect(sie.content).toContain('#TRANS')
  })
})
