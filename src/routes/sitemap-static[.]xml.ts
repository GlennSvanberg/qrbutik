import { createFileRoute } from '@tanstack/react-router'
import { buildSitemapXml, sitemapLastmod } from '~/lib/sitemap'

export const Route = createFileRoute('/sitemap-static.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemapXml(sitemapLastmod()), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
