import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SITE_URL,
  absoluteSiteUrl,
  buildRobotsTxt,
  normalizePublicOrigin,
  resolveSiteUrl,
} from './siteUrl'

describe('siteUrl', () => {
  it('defaults to www', () => {
    expect(DEFAULT_SITE_URL).toBe('https://www.qrbutik.se')
    expect(resolveSiteUrl(undefined)).toBe('https://www.qrbutik.se')
  })

  it('normalizes apex to www', () => {
    expect(normalizePublicOrigin('https://qrbutik.se')).toBe(
      'https://www.qrbutik.se',
    )
    expect(resolveSiteUrl('https://qrbutik.se')).toBe('https://www.qrbutik.se')
    expect(resolveSiteUrl('https://qrbutik.se/')).toBe('https://www.qrbutik.se')
  })

  it('builds absolute paths and robots with www', () => {
    expect(absoluteSiteUrl('/utforska/fotboll')).toBe(
      'https://www.qrbutik.se/utforska/fotboll',
    )
    const robots = buildRobotsTxt()
    expect(robots).toContain('Sitemap: https://www.qrbutik.se/sitemap.xml')
    expect(robots).toContain('LLMS: https://www.qrbutik.se/llms.txt')
  })
})
