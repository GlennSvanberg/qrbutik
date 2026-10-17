import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import { LIVE_KIOSK_LABEL, PRICE_SUMMARY, START_LABEL } from '~/lib/marketing'
import { sportPages } from '~/lib/sports'

export const Route = createFileRoute('/utforska/')({
  head: () => ({
    meta: [
      { title: 'Kiosk för idrottsföreningar | QRButik' },
      {
        name: 'description',
        content:
          'Se hur föreningar i olika idrotter kan köra en digital kiosk med QR-beställning och Swish vid matcher och cuper.',
      },
      { name: 'robots', content: 'index, follow' },
    ],
  }),
  component: ExploreHubPage,
})

function ExploreHubPage() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
            Utforska
          </p>
          <h1 className="text-pretty text-4xl font-bold text-brand-foreground">
            Digital kiosk för idrottsföreningar
          </h1>
          <p className="text-base text-brand-muted">
            QRButik är en kiosk för föreningar som säljer vid matcher, tävlingar
            och cuper. Besökaren beställer via QR och betalar med Swish till
            föreningens eget nummer. {PRICE_SUMMARY}. Alla priser inklusive moms.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-brand-foreground">Sporter</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sportPages.map((sport) => (
              <li key={sport.slug}>
                <Link
                  to="/utforska/$sport"
                  params={{ sport: sport.slug }}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-brand-border bg-surface px-4 py-3 font-semibold text-brand-foreground"
                >
                  {sport.name}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/skapa"
            className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
            trackaton-on-click="signup_started"
          >
            {START_LABEL}
          </Link>
          <Link
            to="/s/$shopSlug"
            params={{ shopSlug: DEMO_SHOP_SLUG }}
            className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-brand-foreground"
            trackaton-on-click="live_kiosk_click"
          >
            {LIVE_KIOSK_LABEL}
          </Link>
          <Link
            to="/priser"
            className="inline-flex h-12 cursor-pointer items-center justify-center px-2 text-base font-semibold text-brand underline decoration-brand-border underline-offset-4"
          >
            Priser
          </Link>
        </div>

        <MarketingFooter />
      </div>
    </main>
  )
}
