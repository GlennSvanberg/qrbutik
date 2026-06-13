import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { TimeSavingsCalculator } from '~/components/TimeSavingsCalculator'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'QRbutik – Sälj med Swish utan krångel',
      },
      {
        name: 'description',
        content:
          'Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer varor och betalar direkt med Swish.',
      },
      {
        property: 'og:title',
        content: 'QRbutik – Sälj med Swish utan krångel',
      },
      {
        property: 'og:description',
        content:
          'Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer varor och betalar direkt med Swish.',
      },
      {
        name: 'twitter:title',
        content: 'QRbutik – Sälj med Swish utan krångel',
      },
      {
        name: 'twitter:description',
        content:
          'Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer varor och betalar direkt med Swish.',
      },
    ],
  }),
  component: Home,
})

const heroKpis: Array<{ label: string; value: string }> = [
  { label: 'Starttid', value: '2 min' },
  { label: 'Installation', value: 'Ingen app' },
  { label: 'Betalning', value: 'Swish direkt' },
]

const painPoints: Array<string> = [
  'Räkna totalsumman i huvudet mitt i kön.',
  'Stava Swish-numret högt om och om igen.',
  'Svårt att veta vad som faktiskt sålts efteråt.',
  'Långsam hantering när många vill handla samtidigt.',
]

const flowWins: Array<string> = [
  'Inbyggd varukorg räknar automatiskt ut summan.',
  'Swish öppnas med rätt belopp och nummer direkt.',
  'Färdig säljrapport direkt till kassören.',
  'Snabbare köer utan extra personal.',
]

const platformDetails: Array<{
  id: string
  title: string
  description: string
}> = [
  {
    id: 'signal',
    title: 'Live-kontroll i admin',
    description:
      'Se inkommande köp direkt och verifiera snabbt i samma vy.',
  },
  {
    id: 'poster',
    title: 'Automatisk QR-skylt',
    description:
      'En färdig skylt för mobil, iPad eller utskrift utan extra verktyg.',
  },
  {
    id: 'pricing',
    title: 'Byggt för föreningslivet',
    description:
      'Inga abonnemangskrav. Betala bara när ni faktiskt säljer.',
  },
]

const pricingPlans: Array<{
  id: string
  name: string
  price: string
  description: string
  cta: string
  tracking: string
  variant: 'primary' | 'secondary'
}> = [
  {
    id: 'event',
    name: 'Event-pass',
    price: '10 kr',
    description: 'Gäller i 48 timmar. Perfekt för matcher, cuper och loppis.',
    cta: 'Starta event-pass',
    tracking: 'start-event-pass',
    variant: 'primary',
  },
  {
    id: 'season',
    name: 'Säsongs-pass',
    price: '99 kr',
    description: 'Gäller i 6 månader och passar hela terminen.',
    cta: 'Starta säsong',
    tracking: 'start-season-pass',
    variant: 'secondary',
  },
]

function Home() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(26,115,232,0.04),_transparent_60%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/qrbutik_logo.png"
                    alt="QRButik logo"
                    className="h-12 w-auto sm:h-14"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                    QRButik.se
                  </p>
                </div>
                <h1 className="text-pretty text-4xl font-bold leading-tight tracking-tight text-brand-foreground sm:text-5xl lg:text-6xl">
                  Sälj med Swish, med ett flöde som känns helt klart.
                </h1>
                <p className="max-w-2xl text-pretty text-base text-brand-muted sm:text-lg">
                  Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer
                  varor och betalar direkt. Mindre stress i kön, bättre
                  kontroll efteråt.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/skapa"
                  className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
                  trackaton-on-click="primary-cta"
                >
                  Skapa din Swish-kiosk &mdash; 10 kr
                </Link>
                <Link
                  to="/utforska"
                  className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-brand-foreground"
                  trackaton-on-click="landing-explore-pseo"
                >
                  Utforska sport och stad
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-brand-muted">
                <span>Har du redan en kiosk?</span>
                <Link
                  to="/admin"
                  className="cursor-pointer font-semibold text-brand-foreground underline decoration-brand-border underline-offset-4 transition hover:text-brand"
                  trackaton-on-click="login-admin"
                >
                  Hantera den h&auml;r
                </Link>
                <span className="text-brand-border">•</span>
                <span className="text-brand-muted">
                  Vi mejlar inloggning direkt till dig.
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-brand-muted">
                <span className="premium-pill">2 minuter</span>
                <span className="premium-pill">Ingen app</span>
                <span className="premium-pill">Swish direkt</span>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                    Kioskkontroll i realtid
                  </p>
                  <span className="premium-pill">Live</span>
                </div>
                <p className="text-sm text-brand-muted">
                  En samlad vy f&ouml;r skapande, betalning och avst&auml;mning.
                  F&auml;rre moment, tydligare fl&ouml;de.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {heroKpis.map((kpi) => (
                    <div key={kpi.label} className="premium-kpi">
                      <p className="premium-kpi-label">{kpi.label}</p>
                      <p className="premium-kpi-value">{kpi.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-lg border border-brand-border bg-[#F8FAFC]">
                    <img
                      src="/before.jpg"
                      alt="Handskriven prislista"
                      className="h-44 w-full object-cover sm:h-48"
                    />
                    <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
                      F&ouml;re: handskrivet
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-brand-border-accent bg-white ring-1 ring-brand/20">
                    <img
                      src="/after.jpg"
                      alt="Digital kiosk med meny"
                      className="h-44 w-full object-cover sm:h-48"
                    />
                    <p className="border-l-4 border-brand px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-brand">
                      Efter: digital meny
                    </p>
                  </div>
                </div>

                <ul className="premium-divider-list text-sm text-brand-muted">
                  <li>Bygg menyn en gång och återanvänd den hela säsongen.</li>
                  <li>Varje köp går direkt till rätt Swish-nummer och belopp.</li>
                  <li>Rapporten är redo när eventet är slut.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 sm:gap-14">
        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                Vanliga problem
              </p>
              <h2 className="text-pretty text-3xl font-bold text-brand-foreground">
                Låt kön rulla, inte huvudräkningen.
              </h2>
              <ul className="space-y-3 text-base text-brand-muted">
                {painPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                      ✕
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                Med QRButik
              </p>
              <h3 className="text-pretty text-2xl font-bold text-brand-foreground">
                Ett modernt kioskflöde i ett sammanhållet paket.
              </h3>
              <ul className="premium-divider-list text-base text-brand-muted">
                {flowWins.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-sm font-bold text-success">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="premium-panel p-8 sm:p-10">
            <div className="premium-shell flex flex-col gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                  Plattformen
                </p>
                <h2 className="mt-4 text-pretty text-3xl font-bold text-brand-foreground">
                  Färre delar, mer flyt i varje försäljning.
                </h2>
              </div>
              <ul className="premium-divider-list">
                {platformDetails.map((item, idx) => (
                  <li key={item.id} className="flex gap-4">
                    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xs font-semibold text-brand">
                      0{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-brand-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-brand-muted">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="premium-panel p-8 sm:p-10">
            <div className="premium-shell flex h-full flex-col">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                  Priser
                </p>
                <h2 className="text-pretty text-3xl font-bold text-brand-foreground">
                  Betala bara n&auml;r ni s&auml;ljer.
                </h2>
              </div>

              <div className="mt-8 flex flex-1 flex-col gap-4">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border border-brand-border bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-brand-muted">
                          {plan.name}
                        </p>
                        <p className="text-3xl font-bold text-brand-foreground">
                          {plan.price}
                        </p>
                      </div>
                      <Link
                        to="/skapa"
                        className={
                          plan.variant === 'primary'
                            ? 'relaxed-primary-button inline-flex h-11 cursor-pointer items-center justify-center px-4 text-sm font-semibold text-white'
                            : 'relaxed-secondary-button inline-flex h-11 cursor-pointer items-center justify-center px-4 text-sm font-semibold text-brand-foreground'
                        }
                        trackaton-on-click={plan.tracking}
                      >
                        {plan.cta}
                      </Link>
                    </div>
                    <p className="mt-3 text-sm text-brand-muted">
                      {plan.description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-brand-muted">
                Ingen inloggning krävs för att börja. Ingen app att ladda ner.
              </p>
            </div>
          </div>
        </section>

        <TimeSavingsCalculator />

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <blockquote className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                Omd&ouml;me
              </p>
              <p className="text-pretty text-2xl font-bold text-brand-foreground">
                “V&aring;r kass&ouml;r &auml;lskar s&auml;ljrapporten. Vi sparar
                timmar varje helg och k&ouml;n r&ouml;r sig snabbare direkt.”
              </p>
              <footer className="text-sm text-brand-muted">
                &mdash; Lagledare, P12 Fotboll
              </footer>
            </blockquote>
            <div className="flex flex-col gap-3">
              <Link
                to="/skapa"
                className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
                trackaton-on-click="landing-bottom-cta"
              >
                Starta kiosken nu
              </Link>
              <p className="text-sm text-brand-muted">
                G&aring; fr&aring;n handskrivet till ett proffsigt fl&ouml;de idag.
              </p>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </main>
  )
}
