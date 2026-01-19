import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const dataPath = path.join(rootDir, 'src', 'lib', 'pseo-data.json')
const publicDir = path.join(rootDir, 'public')

const siteUrl =
  process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? 'https://qrbutik.se'

const buildAbsoluteUrl = (pathname) => {
  try {
    return new URL(pathname, siteUrl).toString()
  } catch {
    return siteUrl
  }
}

const loadPseoData = async () => {
  const raw = await readFile(dataPath, 'utf-8')
  return JSON.parse(raw)
}

const buildSitemap = (urls) => {
  const lastmod = new Date().toISOString()
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
  )
  .join('\n')}
</urlset>`
}

const buildRobots = () => `User-agent: *
Disallow: /admin/
Disallow: /s/
Disallow: /tack/
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
LLMS: ${siteUrl}/llms.txt`

const run = async () => {
  const data = await loadPseoData()
  const sports = data.sports ?? []
  const cities = data.cities ?? []

  const staticPaths = ['/', '/skapa', '/utforska']
  const dynamicPaths = sports.flatMap((sport) =>
    cities.map((city) => `/utforska/${sport.slug}/${city.slug}`),
  )

  const urls = [...staticPaths, ...dynamicPaths].map(buildAbsoluteUrl)

  await mkdir(publicDir, { recursive: true })
  await writeFile(
    path.join(publicDir, 'sitemap.xml'),
    buildSitemap(urls),
    'utf-8',
  )
  await writeFile(
    path.join(publicDir, 'robots.txt'),
    buildRobots(),
    'utf-8',
  )
}

run().catch((error) => {
  console.error('Failed to generate P-SEO sitemap/robots:', error)
  process.exit(1)
})
