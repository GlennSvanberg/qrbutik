import { createFileRoute, notFound } from '@tanstack/react-router'
import { PseoSportLanding } from '~/components/PseoSportLanding'
import {
  getPseoSportCopy,
  getPseoSportHubSlug,
} from '~/lib/pseo'

const SITE_URL =
  (import.meta as { env: { VITE_SITE_URL?: string } }).env.VITE_SITE_URL ??
  'https://qrbutik.se'

const buildAbsoluteUrl = (pathname: string) => {
  try {
    return new URL(pathname, SITE_URL).toString()
  } catch {
    return SITE_URL
  }
}

export const Route = createFileRoute('/utforska/$sport/')({
  loader: ({ params }) => {
    const copy = getPseoSportCopy(params.sport)
    if (!copy) {
      throw notFound()
    }

    return {
      copy,
      pageUrl: buildAbsoluteUrl(getPseoSportHubSlug(copy.sport.slug)),
    }
  },
  head: ({ loaderData, params }) => {
    const copy = loaderData?.copy ?? getPseoSportCopy(params.sport)
    if (!copy || !loaderData) {
      return {
        meta: [
          { title: 'Sidan hittades inte | QRButik' },
          { name: 'robots', content: 'noindex, nofollow' },
        ],
      }
    }

    const sportLower = copy.sport.name.toLowerCase()
    const title = `Kiosksystem för föreningar inom ${sportLower} | QRButik`
    const description = `Digitalt kiosksystem för föreningar inom ${sportLower} — klubblicens från 995 kr/mån. Swish-kiosk, central överblick och export för styrelse och kassör.`
    const breadcrumb = [
      { name: 'Hem', item: buildAbsoluteUrl('/') },
      { name: 'Lösningar', item: buildAbsoluteUrl('/utforska') },
      { name: copy.sport.name, item: loaderData.pageUrl },
    ]

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: loaderData.pageUrl },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
        {
          name: 'robots',
          content:
            'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        },
        {
          'script:ld+json': {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': `${loaderData.pageUrl}#webpage`,
                url: loaderData.pageUrl,
                name: title,
                description,
                inLanguage: 'sv-SE',
              },
              {
                '@type': 'FAQPage',
                '@id': `${loaderData.pageUrl}#faq`,
                mainEntity: copy.faq.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${loaderData.pageUrl}#breadcrumb`,
                itemListElement: breadcrumb.map((entry, idx) => ({
                  '@type': 'ListItem',
                  position: idx + 1,
                  name: entry.name,
                  item: entry.item,
                })),
              },
            ],
          },
        },
      ],
    }
  },
  component: SportHubPage,
})

function SportHubPage() {
  const { copy, pageUrl } = Route.useLoaderData()
  return <PseoSportLanding copy={copy} pageUrl={pageUrl} />
}
