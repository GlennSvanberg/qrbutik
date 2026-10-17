import { createFileRoute } from '@tanstack/react-router'
import { buildSitemapXml, sitemapLastmod } from '~/lib/sitemap'

function sitemapResponse(): Response {
  return new Response(buildSitemapXml(sitemapLastmod()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => sitemapResponse(),
    },
  },
})
