import { describe, expect, it } from 'vitest'
import {
  isSubscriptionActive,
  normalizeEmail,
} from './validators'

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Treasurer@Klubb.SE  ')).toBe(
      'treasurer@klubb.se',
    )
  })
})

describe('isSubscriptionActive', () => {
  it('allows trialing and active', () => {
    expect(isSubscriptionActive('trialing')).toBe(true)
    expect(isSubscriptionActive('active')).toBe(true)
  })

  it('blocks inactive billing states', () => {
    expect(isSubscriptionActive('inactive')).toBe(false)
    expect(isSubscriptionActive('past_due')).toBe(false)
    expect(isSubscriptionActive('canceled')).toBe(false)
  })
})
