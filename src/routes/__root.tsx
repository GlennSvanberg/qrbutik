import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

const SITE_URL =
  (import.meta as any).env.VITE_SITE_URL ?? 'https://qrbutik.se'
const SITE_NAME = 'QRbutik'
const SITE_TAGLINE = 'Sälj med Swish utan krångel'
const DEFAULT_DESCRIPTION =
  'Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer varor och betalar direkt med Swish.'
const OG_IMAGE_PATH = '/og.jpg'

const buildAbsoluteUrl = (pathname: string) => {
  try {
    return new URL(pathname, SITE_URL).toString()
  } catch {
    return SITE_URL
  }
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: ({ match }) => {
    const canonicalUrl = buildAbsoluteUrl(match.pathname || '/')
    const ogImageUrl = buildAbsoluteUrl(OG_IMAGE_PATH)

    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: `${SITE_NAME} – ${SITE_TAGLINE}`,
        },
        {
          name: 'description',
          content: DEFAULT_DESCRIPTION,
        },
        {
          property: 'og:site_name',
          content: SITE_NAME,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:title',
          content: `${SITE_NAME} – ${SITE_TAGLINE}`,
        },
        {
          property: 'og:description',
          content: DEFAULT_DESCRIPTION,
        },
        {
          property: 'og:url',
          content: canonicalUrl,
        },
        {
          property: 'og:image',
          content: ogImageUrl,
        },
        {
          property: 'og:locale',
          content: 'sv_SE',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: `${SITE_NAME} – ${SITE_TAGLINE}`,
        },
        {
          name: 'twitter:description',
          content: DEFAULT_DESCRIPTION,
        },
        {
          name: 'twitter:image',
          content: ogImageUrl,
        },
        {
          'script:ld+json': {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${SITE_URL}/#organization`,
                name: 'Inventing',
                url: SITE_URL,
                email: 'glenn@inventing.se',
                telephone: '0735029113',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Barometergatan 8',
                  postalCode: '41841',
                  addressLocality: 'Göteborg',
                  addressCountry: 'SE',
                },
                brand: {
                  '@type': 'Brand',
                  name: SITE_NAME,
                },
              },
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: SITE_URL,
                publisher: {
                  '@id': `${SITE_URL}/#organization`,
                },
                inLanguage: 'sv-SE',
              },
            ],
          },
        },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'canonical', href: canonicalUrl },
      ],
    }
  },
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
