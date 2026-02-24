import { Link, createFileRoute } from '@tanstack/react-router'
import {
  getAllCities,
  getAllPseoPages,
  getAllSports,
  getPseoSportHubSlug,
} from '~/lib/pseo'

export const Route = createFileRoute('/utforska/')({
  head: () => ({
    meta: [
      {
        title: 'Utforska sport och stad | QRButik',
      },
      {
        name: 'description',
        content:
          'Hitta QRButik-lösningar för din sport och stad. Utforska fotboll, handboll och fler föreningar i Sverige.',
      },
      {
        property: 'og:title',
        content: 'Utforska sport och stad | QRButik',
      },
      {
        property: 'og:description',
        content:
          'Hitta QRButik-lösningar för din sport och stad. Utforska fotboll, handboll och fler föreningar i Sverige.',
      },
      {
        name: 'robots',
        content:
          'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      },
    ],
  }),
  component: DiscoverPage,
})

function DiscoverPage() {
  const pages = getAllPseoPages()
  const sports = getAllSports()
  const cities = getAllCities()
  const totalPages = pages.length

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(146,116,84,0.14),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-stone-50" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Utforska QRButik
              </p>
              <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl">
                Hitta rätt kiosk för din sport och stad.
              </h1>
              <p className="max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                Välj sport och stad för att se hur QRButik gör kiosken snabbare,
                tydligare och enklare att driva. Börja gärna med en sportsida och
                välj sedan rätt stad.
              </p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="premium-pill">{sports.length} sporter</span>
                <span className="premium-pill">{cities.length} städer</span>
                <span className="premium-pill">{totalPages} kombinationer</span>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Sporter
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sports.map((sport) => (
                      <Link
                        key={sport.slug}
                        to={getPseoSportHubSlug(sport.slug)}
                        className="premium-pill cursor-pointer normal-case tracking-normal text-xs"
                      >
                        {sport.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Städer
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <span
                        key={city.slug}
                        className="premium-pill normal-case tracking-normal text-xs"
                      >
                        {city.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
        <div className="premium-panel p-8 sm:p-10">
          <div className="premium-shell">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="premium-pill normal-case tracking-normal">
                  {totalPages} kombinationer
                </span>
                <span>Välj sport och stad för att komma igång.</span>
              </div>
              <h2 className="text-pretty text-2xl font-semibold text-slate-900">
                Börja med en sport
              </h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sports.map((sport) => (
                <Link
                  key={sport.slug}
                  to={getPseoSportHubSlug(sport.slug)}
                  className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50/90 px-4 py-4 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{sport.name}</p>
                  <p className="text-xs text-slate-500">
                    {sport.matchContext} • {sport.crowdContext}
                  </p>
                  <span className="text-xs font-semibold text-stone-700">
                    Se alla städer →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-panel p-8 sm:p-10">
          <div className="premium-shell">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="premium-pill normal-case tracking-normal">
                  {totalPages} kombinationer
                </span>
                <span>Direktlänkar till varje sport och stad.</span>
              </div>
              <h2 className="text-pretty text-2xl font-semibold text-slate-900">
                Hitta rätt sida direkt
              </h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  to={page.slug}
                  trackaton-on-click="discover-page"
                  className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/90 px-4 py-3 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {page.sport.name} i {page.city.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {page.city.region} • {page.sport.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-stone-700 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-panel p-8 text-center">
          <div className="premium-shell flex flex-col items-center gap-3">
            <p className="text-sm text-slate-600">
              Vill du starta kiosken direkt?
            </p>
            <Link
              to="/skapa"
              className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-sm font-semibold text-white"
              trackaton-on-click="discover-create-kiosk"
            >
              Skapa kiosk på 2 minuter
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
