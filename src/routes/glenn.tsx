import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingCtas } from '~/components/MarketingCtas'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import { SITE_TAGLINE } from '~/lib/marketing'
import { useRecordPlatformVisit } from '~/lib/platformTracking'

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
  useRecordPlatformVisit({ type: 'page_view', path: '/glenn' })

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="relaxed-surface p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
            QRButik.se
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-brand-foreground">
            Det här var en demo av QRButik
          </h1>
          <p className="mt-3 text-sm text-brand-muted">
            Du har precis sett hur QRButik fungerar: välj varor, få totalsumma,
            betala med Swish och få ett kvitto — samma flöde som er föreningskiosk.
          </p>
        </header>

        <section className="relaxed-surface border-brand-border bg-surface-muted/70 p-8 text-center">
          <h2 className="text-xl font-semibold text-brand-foreground">{SITE_TAGLINE}</h2>
          <p className="mt-2 text-sm text-brand-muted">
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
              className="text-sm font-semibold text-brand-muted underline decoration-brand-border underline-offset-4"
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
