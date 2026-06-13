import { describe, expect, it } from 'vitest'
import {
  formatMrr,
  stripeCustomerDashboardUrl,
  stripeDashboardHomeUrl,
} from './superadminUi'

describe('superadminUi', () => {
  it('formats MRR with monthly suffix', () => {
    expect(formatMrr(995)).toMatch(/995.*\/mån/)
  })

  it('builds test-mode Stripe customer URLs by default', () => {
    expect(stripeCustomerDashboardUrl('cus_123')).toBe(
      'https://dashboard.stripe.com/test/customers/cus_123',
    )
    expect(stripeDashboardHomeUrl()).toBe(
      'https://dashboard.stripe.com/test/dashboard',
    )
  })
})
