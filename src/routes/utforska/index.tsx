import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingCtas } from '~/components/MarketingCtas'
import { MarketingFooter } from '~/components/MarketingFooter'
import { DEFAULT_DESCRIPTION, SITE_TAGLINE } from '~/lib/marketing'
import { getAllSports, getPseoSportHubSlug } from '~/lib/pseo'

export const Route = createFileRoute('/utforska/')({
  head: () => ({
    meta: [
      {
        title: `Kiosksystem för idrottsföreningar | QRButik`,
      },
      {
        name: 'description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        property: 'og:title',
        content: `Kiosksystem för idrottsföreningar | QRButik`,
      },
      {
        property: 'og:description',
        content: DEFAULT_DESCRIPTION,
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
  const sports = getAllSports()

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(26,115,232,0.04),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-stone-50" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Lösningar per sport
              </p>
              <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl">
                {SITE_TAGLINE}
              </h1>
              <p className="max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                QRButik är ett kiosksystem för idrottsföreningar — Swish-betalning,
                flera kiosker under samma klubblicens och export för kassör och
                styrelse. Välj er sport nedan.
              </p>
              <MarketingCtas
                primaryTracking="discover-trial"
                secondaryTracking="discover-demo"
              />
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="premium-pill">{sports.length} sporter</span>
                <span className="premium-pill">Från 995 kr/mån</span>
                <span className="premium-pill">14 dagars provperiod</span>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  För styrelse och kassör
                </p>
                <ul className="premium-divider-list text-sm text-slate-600">
                  <li>Obegränsat antal kiosker under samma klubblicens</li>
                  <li>Swish till föreningens eget nummer — utan Business API</li>
                  <li>Central överblick och export till CSV/SIE</li>
                  <li>Roller för owner, kassör och lagledare</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
        <div className="premium-panel p-8 sm:p-10">
          <div className="premium-shell">
            <h2 className="text-pretty text-2xl font-semibold text-slate-900">
              Välj er sport
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Varje sida beskriver hur QRButik passar just er typ av förening
              och matchmiljö.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sports.map((sport) => (
                <Link
                  key={sport.slug}
                  to={getPseoSportHubSlug(sport.slug)}
                  className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50/90 px-4 py-4 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    Föreningar inom {sport.name.toLowerCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {sport.matchContext} • {sport.crowdContext}
                  </p>
                  <span className="text-xs font-semibold text-stone-700">
                    Läs mer →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <MarketingFooter />
      </section>
    </main>
  )
}
