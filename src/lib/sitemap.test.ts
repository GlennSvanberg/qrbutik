import { describe, expect, it } from 'vitest'
import { pricingPlans } from './pricingPlans'
import { buildSitemapXml, publicSitemapPaths, sitemapLastmod } from './sitemap'
import { getSport, sportPages } from './sports'

describe('public sitemap', () => {
  it('lists the public pages and every sport with the given lastmod', () => {
    const xml = buildSitemapXml('2026-10-17')
    for (const path of publicSitemapPaths()) {
      const loc = path === '/' ? 'https://qrbutik.se/' : `https://qrbutik.se${path}`
      expect(xml).toContain(`<loc>${loc}</loc>`)
    }
    expect(xml.match(/<lastmod>2026-10-17<\/lastmod>/g)).toHaveLength(
      publicSitemapPaths().length,
    )
    expect(xml).not.toContain('/admin')
    expect(xml).not.toContain('/s/')
    expect(publicSitemapPaths()).toEqual([
      '/',
      '/skapa',
      '/kontakt',
      '/priser',
      '/utforska',
      ...sportPages.map((sport) => `/utforska/${sport.slug}`),
    ])
  })

  it('uses the calendar date as lastmod', () => {
    expect(sitemapLastmod(new Date('2026-10-17T16:12:00.000Z'))).toBe('2026-10-17')
  })
})

describe('pricing plans', () => {
  it('keeps Gratis, Event and Säsong as the shared prices', () => {
    expect(pricingPlans.map((plan) => `${plan.name} ${plan.price}`)).toEqual([
      'Gratis 0 kr',
      'Event 295 kr',
      'Säsong 1 495 kr/år',
    ])
  })
})

describe('sport pages', () => {
  it('has unique copy and no unknown lookup', () => {
    const titles = new Set(sportPages.map((sport) => sport.title))
    const descriptions = new Set(sportPages.map((sport) => sport.description))
    expect(titles.size).toBe(sportPages.length)
    expect(descriptions.size).toBe(sportPages.length)
    expect(getSport('okänd')).toBeUndefined()
    expect(getSport('fotboll')?.name).toBe('Fotboll')
    expect(sportPages.map((sport) => sport.slug)).toEqual([
      'fotboll',
      'ishockey',
      'handboll',
      'innebandy',
      'basket',
      'bandy',
      'friidrott',
      'simning',
      'ridning',
      'gymnastik',
    ])
    for (const sport of sportPages) {
      expect(sport.h1.length).toBeGreaterThan(0)
      expect(sport.paragraphs.join(' ')).toContain('Swish')
      expect(sport.paragraphs.join(' ')).toContain('QR')
      expect(sport.paragraphs.join(' ').toLowerCase()).not.toContain('fortnox')
      expect(sport.paragraphs.join(' ').toLowerCase()).not.toContain('visma')
    }
  })
})
