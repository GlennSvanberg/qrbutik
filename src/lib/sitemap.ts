import { sportPages } from '~/lib/sports'

export const SITEMAP_HOST = 'https://qrbutik.se'

const staticPaths = ['/', '/skapa', '/kontakt', '/priser', '/utforska'] as const

export function publicSitemapPaths(): Array<string> {
  return [
    ...staticPaths,
    ...sportPages.map((sport) => `/utforska/${sport.slug}`),
  ]
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function buildSitemapXml(lastmod: string): string {
  const urls = publicSitemapPaths()
    .map((path) => {
      const loc = path === '/' ? `${SITEMAP_HOST}/` : `${SITEMAP_HOST}${path}`
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function sitemapLastmod(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}
