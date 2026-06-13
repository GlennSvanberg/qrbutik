import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingCtas } from '~/components/MarketingCtas'
import { DEMO_SHOP_SLUG } from '~/lib/demo'

export const Route = createFileRoute('/glenn')({
  head: () => ({
    meta: [
      {
        title: 'Demo – QRButik',
      },
      {
        name: 'description',
        content:
          'Demo av QRButik-checkout för idrottsföreningar. Starta 14 dagars provperiod eller boka demo.',
      },
    ],
  }),
  component: GlennDemoLanding,
})

function GlennDemoLanding() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="relaxed-surface p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Det här var en demo av QRButik
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Du har precis sett hur QRButik fungerar: välj varor, få totalsumma,
            betala med Swish och få ett kvitto — samma flöde som er föreningskiosk.
          </p>
        </header>

        <section className="relaxed-surface border-stone-200 bg-stone-50/70 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">{SITE_TAGLINE}</h2>
          <p className="mt-2 text-sm text-slate-600">
            QRButik riktar sig till idrottsföreningar och cuper — klubblicens med
            flera kiosker, central överblick och export för kassör och styrelse.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <MarketingCtas
              primaryTracking="glenn-landing-trial"
              secondaryTracking="glenn-landing-demo"
              layout="stack"
            />
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: DEMO_SHOP_SLUG }}
              className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4"
              trackaton-on-click="demo-landing-back-kiosk"
            >
              Tillbaka till demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
