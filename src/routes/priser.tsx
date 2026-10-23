import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import { LIVE_KIOSK_LABEL, START_LABEL } from '~/lib/marketing'
import { PricingFaqList } from '~/components/PricingFaqList'
import { pricingPlans } from '~/lib/pricingPlans'

export const Route = createFileRoute('/priser')({
  head: () => ({
    meta: [
      { title: 'Priser | QRButik' },
      {
        name: 'description',
        content:
          'Gratis med 1 kiosk, Event 295 kr som engångsköp och Säsong 1 495 kr per år. Alla priser inklusive 25 % moms.',
      },
      { name: 'robots', content: 'index, follow' },
    ],
  }),
  component: PricingPage,
})

function PricingPage() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
            Priser
          </p>
          <h1 className="text-pretty text-4xl font-bold text-brand-foreground">
            Gratis, Event eller Säsong
          </h1>
          <p className="text-base text-brand-muted">
            QRButik är till för idrottsföreningar och cuparrangörer. Alla priser
            är inklusive 25 % moms. Kunder betalar med Swish till föreningens
            eget nummer.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-lg border border-brand-border bg-surface p-5 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-brand-muted">{plan.name}</h2>
              <p className="text-3xl font-bold text-brand-foreground">{plan.price}</p>
              <p className="mt-3 text-sm text-brand-muted">{plan.description}</p>
            </article>
          ))}
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
        </div>

        <section className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-brand-foreground">Vanliga frågor</h2>
          <PricingFaqList />
        </section>

        <p className="text-sm text-brand-muted">
          <Link
            to="/"
            className="cursor-pointer font-semibold text-brand-foreground underline decoration-brand-border underline-offset-4"
          >
            ← Till startsidan
          </Link>
        </p>
        <MarketingFooter />
      </div>
    </main>
  )
}
