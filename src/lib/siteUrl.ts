/** Primary public origin (www). Override with VITE_SITE_URL in deploy env. */
export const DEFAULT_SITE_URL = 'https://www.qrbutik.se'

export function resolveSiteUrl(
  envValue?: string,
): string {
  const trimmed = (envValue ?? import.meta.env.VITE_SITE_URL)?.trim()
  if (trimmed) {
    return normalizePublicOrigin(trimmed.replace(/\/$/, ''))
  }
  return DEFAULT_SITE_URL
}

/** Apex qrbutik.se → www (local dev and other hosts unchanged). */
export function normalizePublicOrigin(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'qrbutik.se') {
      parsed.hostname = 'www.qrbutik.se'
    }
    return parsed.origin
  } catch {
    return url.replace(/\/$/, '')
  }
}

export function absoluteSiteUrl(pathname: string, base = resolveSiteUrl()): string {
  try {
    return new URL(pathname, base).toString()
  } catch {
    return base
  }
}

export function buildRobotsTxt(base = resolveSiteUrl()): string {
  return `User-agent: *
Disallow: /admin/
Disallow: /s/
Disallow: /tack/
Allow: /

Sitemap: ${base}/sitemap.xml
Sitemap: ${base}/sitemap-static.xml
LLMS: ${base}/llms.txt
`
}
