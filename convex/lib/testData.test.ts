import { describe, expect, it } from 'vitest'
import {
  isE2eTestEmail,
  isE2eTestOrganization,
  isE2eTestOrgName,
  isE2eTestShop,
  isE2eTestShopSlug,
} from './testData'

describe('testData', () => {
  it('detects E2E org names and slugs', () => {
    expect(isE2eTestOrgName('E2E Verify 1781367803597')).toBe(true)
    expect(isE2eTestOrgName('Test IF')).toBe(false)
    expect(isE2eTestShopSlug('e2e-verify-1781367803597')).toBe(true)
    expect(isE2eTestShopSlug('demo')).toBe(false)
  })

  it('detects Playwright test emails without matching integration fixtures', () => {
    expect(isE2eTestEmail('e2e+kiosk-verify-123@qrbutik.test')).toBe(true)
    expect(isE2eTestEmail('owner@qrbutik.test')).toBe(false)
    expect(isE2eTestEmail('demo@qrbutik.se')).toBe(false)
  })

  it('combines org and shop heuristics', () => {
    expect(
      isE2eTestOrganization({
        name: 'E2E Export 123',
        billingEmail: 'treasurer@example.com',
      }),
    ).toBe(true)
    expect(
      isE2eTestOrganization({
        name: 'Test IF',
        billingEmail: 'e2e+members-123@qrbutik.test',
      }),
    ).toBe(true)
    expect(
      isE2eTestOrganization({
        name: 'Glenn IK',
        billingEmail: 'glenn@example.com',
      }),
    ).toBe(false)
    expect(isE2eTestShop({ slug: 'e2e-products-123' })).toBe(true)
  })
})
