import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { CLUB_LICENSE_PRICE, DEMO_EMAIL, LIVE_KIOSK_LABEL, SITE_TAGLINE } from '~/lib/marketing'
import { DEMO_SHOP_SLUG } from '~/lib/demo'

export const Route = createFileRoute('/kontakt')({
  head: () => ({
    meta: [
      {
        title: 'Kontakt och demo | QRButik',
      },
      {
        name: 'description',
        content:
          'Boka demo av QRButik för er idrottsförening eller starta 14 dagars provperiod. Klubblicens från 995 kr/mån.',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
    ],
  }),
  component: KontaktPage,
})

function KontaktPage() {
  const demoMailto = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent('Boka demo — QRButik')}`

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
            Kontakt
          </p>
          <h1 className="text-pretty text-4xl font-bold text-brand-foreground">
            {SITE_TAGLINE}
          </h1>
          <p className="text-base text-brand-muted">
            QRButik riktar sig till idrottsföreningar och cuparrangörer. Boka
            en demo eller starta provperiod direkt.
          </p>
        </header>

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold text-brand-foreground">
                Boka demo
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                Vi visar hur styrelse och kassör sätter upp kiosker, tar betalt
                med Swish och exporterar till bokföring. {CLUB_LICENSE_PRICE}.
              </p>
              <a
                href={demoMailto}
                className="relaxed-primary-button mt-4 inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
                trackaton-on-click="kontakt-demo-email"
              >
                Mejla {DEMO_EMAIL}
              </a>
            </div>

            <div className="border-t border-brand-border pt-6">
              <h2 className="text-xl font-semibold text-brand-foreground">
                Prova kiosken live
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                Se hur kunder väljer varor och betalar med Swish — samma flöde som
                i er föreningskiosk, med riktig data.
              </p>
              <div className="mt-4">
                <Link
                  to="/s/$shopSlug"
                  params={{ shopSlug: DEMO_SHOP_SLUG }}
                  className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-brand-foreground"
                  trackaton-on-click="kontakt-live-kiosk"
                >
                  {LIVE_KIOSK_LABEL}
                </Link>
              </div>
            </div>

            <div className="border-t border-brand-border pt-6">
              <h2 className="text-xl font-semibold text-brand-foreground">
                Eller prova själv
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                Skapa förening och testa 14 dagar utan betalkort. Lägg till
                kiosker i admin när ni är redo.
              </p>
              <div className="mt-4">
                <Link
                  to="/logga-in"
                  search={{ redirect: '/skapa' }}
                  className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
                  trackaton-on-click="kontakt-trial"
                >
                  Starta 14 dagars provperiod
                </Link>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-sm text-brand-muted">
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
