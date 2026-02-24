import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const dataPath = path.join(rootDir, 'src', 'lib', 'pseo-data.json')
const publicDir = path.join(rootDir, 'public')
const staticSitemapPath = '/sitemap-static.xml'
const pseoSitemapPath = '/sitemap-pseo.xml'

const siteUrl =
  process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? 'https://qrbutik.se'

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

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

const getLastmodFromSources = async (sourceFiles) => {
  const mtimes = await Promise.all(
    sourceFiles.map(async (filePath) => {
      try {
        const sourceStats = await stat(path.join(rootDir, filePath))
        return sourceStats.mtimeMs
      } catch {
        return 0
      }
    }),
  )
  const latestMtime = Math.max(...mtimes, Date.now())
  return new Date(latestMtime).toISOString()
}

const buildUrlsetSitemap = (entries) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`
}

const buildSitemapIndex = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <sitemap>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>`

const buildRobots = () => `User-agent: *
Disallow: /admin/
Disallow: /s/
Disallow: /tack/
Allow: /

Sitemap: ${buildAbsoluteUrl('/sitemap.xml')}
Sitemap: ${buildAbsoluteUrl(staticSitemapPath)}
Sitemap: ${buildAbsoluteUrl(pseoSitemapPath)}
LLMS: ${siteUrl}/llms.txt`

const run = async () => {
  const data = await loadPseoData()
  const sports = data.sports ?? []
  const cities = data.cities ?? []
  const staticLastmod = await getLastmodFromSources([
    'src/routes/__root.tsx',
    'src/routes/index.tsx',
    'src/routes/skapa.tsx',
    'src/routes/utforska/index.tsx',
  ])
  const pseoLastmod = await getLastmodFromSources([
    'src/lib/pseo-data.json',
    'src/lib/pseo.ts',
    'src/routes/utforska/index.tsx',
    'src/routes/utforska/$sport/index.tsx',
    'src/routes/utforska/$sport/$city/index.tsx',
  ])

  const staticEntries = [
    {
      loc: buildAbsoluteUrl('/'),
      lastmod: staticLastmod,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      loc: buildAbsoluteUrl('/skapa'),
      lastmod: staticLastmod,
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      loc: buildAbsoluteUrl('/utforska'),
      lastmod: staticLastmod,
      changefreq: 'daily',
      priority: '0.9',
    },
  ]
  const dynamicPaths = sports.flatMap((sport) =>
    cities.map((city) => `/utforska/${sport.slug}/${city.slug}`),
  )
  const sportHubPaths = sports.map((sport) => `/utforska/${sport.slug}`)
  const uniqueDynamicPaths = [...new Set(dynamicPaths)].sort()
  const pseoEntries = [
    ...sportHubPaths.map((pathname) => ({
      loc: buildAbsoluteUrl(pathname),
      lastmod: pseoLastmod,
      changefreq: 'daily',
      priority: '0.8',
    })),
    ...uniqueDynamicPaths.map((pathname) => ({
      loc: buildAbsoluteUrl(pathname),
      lastmod: pseoLastmod,
      changefreq: 'daily',
      priority: '0.7',
    })),
  ]
  const sitemapIndexEntries = [
    {
      loc: buildAbsoluteUrl(staticSitemapPath),
      lastmod: staticLastmod,
    },
    {
      loc: buildAbsoluteUrl(pseoSitemapPath),
      lastmod: pseoLastmod,
    },
  ]

  await mkdir(publicDir, { recursive: true })
  await writeFile(
    path.join(publicDir, staticSitemapPath.slice(1)),
    buildUrlsetSitemap(staticEntries),
    'utf-8',
  )
  await writeFile(
    path.join(publicDir, pseoSitemapPath.slice(1)),
    buildUrlsetSitemap(pseoEntries),
    'utf-8',
  )
  await writeFile(
    path.join(publicDir, 'sitemap.xml'),
    buildSitemapIndex(sitemapIndexEntries),
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
