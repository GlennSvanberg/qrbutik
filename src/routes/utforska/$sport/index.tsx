import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import {
  getPseoPagesForSport,
  getPseoSportHubSlug,
  getSportBySlug,
} from '~/lib/pseo'

const SITE_URL =
  (import.meta as any).env.VITE_SITE_URL ?? 'https://qrbutik.se'

const buildAbsoluteUrl = (pathname: string) => {
  try {
    return new URL(pathname, SITE_URL).toString()
  } catch {
    return SITE_URL
  }
}

type GroupedRegion = {
  region: string
  pages: Array<{ cityName: string; slug: string }>
}

export const Route = createFileRoute('/utforska/$sport/')({
  loader: ({ params }) => {
    const sport = getSportBySlug(params.sport)
    if (!sport) {
      throw notFound()
    }

    const pages = getPseoPagesForSport(sport.slug)
      .map((page) => ({
        cityName: page.city.name,
        region: page.city.region,
        slug: page.slug,
      }))
      .sort((a, b) => a.cityName.localeCompare(b.cityName, 'sv'))

    const groupedMap = new Map<string, Array<{ cityName: string; slug: string }>>()
    for (const page of pages) {
      const existing = groupedMap.get(page.region) ?? []
      existing.push({ cityName: page.cityName, slug: page.slug })
      groupedMap.set(page.region, existing)
    }

    const groupedByRegion: Array<GroupedRegion> = Array.from(
      groupedMap.entries(),
    )
      .map(([region, regionPages]) => ({
        region,
        pages: regionPages,
      }))
      .sort((a, b) => a.region.localeCompare(b.region, 'sv'))

    return {
      sport,
      pages,
      groupedByRegion,
      pageUrl: buildAbsoluteUrl(getPseoSportHubSlug(sport.slug)),
    }
  },
  head: ({ loaderData, params }) => {
    const sport = loaderData?.sport ?? getSportBySlug(params.sport)
    if (!sport || !loaderData) {
      return {
        meta: [
          {
            title: 'Sidan hittades inte | QRButik',
          },
          {
            name: 'robots',
            content: 'noindex, nofollow',
          },
        ],
      }
    }

    const title = `QR-kiosk för ${sport.name} i Sverige | QRButik`
    const description = `Se hur ${sport.name.toLowerCase()} kan använda QRButik i ${loaderData.pages.length} svenska städer. Jämför lokala sidor och hitta rätt upplägg för er förening.`
    const breadcrumb = [
      { name: 'Hem', item: buildAbsoluteUrl('/') },
      { name: 'Utforska', item: buildAbsoluteUrl('/utforska') },
      { name: sport.name, item: loaderData.pageUrl },
    ]

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:url',
          content: loaderData.pageUrl,
        },
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
                '@type': 'CollectionPage',
                '@id': `${loaderData.pageUrl}#collection`,
                url: loaderData.pageUrl,
                name: title,
                description,
                inLanguage: 'sv-SE',
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
              {
                '@type': 'ItemList',
                '@id': `${loaderData.pageUrl}#cities`,
                itemListElement: loaderData.pages.slice(0, 40).map((entry, idx) => ({
                  '@type': 'ListItem',
                  position: idx + 1,
                  name: `${sport.name} i ${entry.cityName}`,
                  url: buildAbsoluteUrl(entry.slug),
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
  const { sport, groupedByRegion, pages } = Route.useLoaderData()

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(146,116,84,0.14),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-stone-50" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <nav
                aria-label="Brödsmulor"
                className="flex flex-wrap items-center gap-2 text-xs text-slate-500"
              >
                <Link
                  to="/"
                  className="cursor-pointer underline decoration-slate-300 underline-offset-4"
                >
                  Hem
                </Link>
                <span>/</span>
                <Link
                  to="/utforska"
                  className="cursor-pointer underline decoration-slate-300 underline-offset-4"
                >
                  Utforska
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-700">{sport.name}</span>
              </nav>

              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Sportöversikt
                </p>
                <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl">
                  QR-kiosk för {sport.name} i svenska städer.
                </h1>
                <p className="max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                  En samlad sida för alla lokala {sport.name.toLowerCase()}-sidor.
                  Välj stad nedan och få en version med konkret lokal kontext,
                  snabb Swish-betalning och tydlig kioskrutin.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="premium-pill">{pages.length} städer</span>
                <span className="premium-pill">{sport.matchContext}</span>
                <span className="premium-pill">Swish direkt</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/skapa"
                  className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
                >
                  Skapa kiosk för {sport.name.toLowerCase()}
                </Link>
                <Link
                  to="/utforska"
                  className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-slate-700"
                >
                  Se alla sporter
                </Link>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Typisk matchsituation
                </p>
                <p className="text-sm text-slate-600">
                  Vid {sport.matchContext.toLowerCase()} och {sport.crowdContext}{' '}
                  behöver kiosken vara enkel för både publik och kassör.
                </p>
                <ul className="premium-divider-list text-sm text-slate-600">
                  {sport.commonItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16">
        {groupedByRegion.map((region) => (
          <div key={region.region} className="premium-panel p-8 sm:p-10">
            <div className="premium-shell">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {sport.name} i {region.region}
                </h2>
                <span className="premium-pill normal-case tracking-normal">
                  {region.pages.length} städer
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {region.pages.map((page) => (
                  <Link
                    key={page.slug}
                    to={page.slug}
                    className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/90 px-4 py-3 transition hover:border-stone-300 hover:bg-stone-50"
                  >
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {sport.name} i {page.cityName}
                    </span>
                    <span className="text-sm font-semibold text-stone-700 transition group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
