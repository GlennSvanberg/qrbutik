import { describe, expect, it } from 'vitest'
import { generateSwishLink } from './swish'

describe('generateSwishLink', () => {
  it('builds a swish deep link with cleaned number and amount', () => {
    const link = generateSwishLink('070-123 45 67', 125, 'Kiosk test')

    expect(link.startsWith('swish://payment?data=')).toBe(true)
    expect(link).toContain('"value":"0701234567"')
    expect(link).toContain('"value":125')
  })

  it('omits callback for non-https urls', () => {
    const link = generateSwishLink(
      '1234567890',
      50,
      'Ref',
      'http://localhost:5173/tack/abc',
    )

    expect(link).not.toContain('callbackurl')
  })

  it('includes https callback when provided', () => {
    const callback = 'https://qrbutik.se/tack/abc'
    const link = generateSwishLink('1234567890', 50, 'Ref', callback)

    expect(link).toContain(
      `callbackurl=${encodeURIComponent(callback)}`,
    )
  })
})
