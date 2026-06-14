import { Link, createFileRoute } from '@tanstack/react-router'
import { MarketingCtas } from '~/components/MarketingCtas'
import { MarketingFooter } from '~/components/MarketingFooter'
import { MarketingHeader } from '~/components/MarketingHeader'
import { TimeSavingsCalculator } from '~/components/TimeSavingsCalculator'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import {
  CLUB_LICENSE_PRICE,
  DEFAULT_DESCRIPTION,
  LIVE_KIOSK_LABEL,
  SITE_NAME,
  SITE_TAGLINE,
  TRIAL_LABEL,
} from '~/lib/marketing'
import { useRecordPlatformVisit } from '~/lib/platformTracking'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: `${SITE_NAME} – ${SITE_TAGLINE}`,
      },
      {
        name: 'description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        property: 'og:title',
        content: `${SITE_NAME} – ${SITE_TAGLINE}`,
      },
      {
        property: 'og:description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        name: 'twitter:title',
        content: `${SITE_NAME} – ${SITE_TAGLINE}`,
      },
      {
        name: 'twitter:description',
        content: DEFAULT_DESCRIPTION,
      },
    ],
  }),
  component: Home,
})

const heroKpis: Array<{ label: string; value: string }> = [
  { label: 'Provperiod', value: '14 dagar' },
  { label: 'Kiosker', value: 'Obegränsat' },
  { label: 'Betalning', value: 'Swish direkt' },
]

const comparisonRows: Array<{ problem: string; solution: string }> = [
  {
    problem: 'Totalsummor räknas i huvudet mitt i kön.',
    solution: 'Varukorg och Swish öppnas med rätt belopp direkt.',
  },
  {
    problem: 'Försäljning från flera lag blir Excel och papperslappar.',
    solution: 'Alla kiosker syns i samma vy för kassör och styrelse.',
  },
  {
    problem: 'Bokföring tar timmar efter cuphelgen.',
    solution: 'Export till CSV eller SIE på några minuter.',
  },
  {
    problem: 'Långsam kiosk när kön växer.',
    solution: 'Snabbare flöde utan extra personal vid kassan.',
  },
]

const platformDetails: Array<{
  id: string
  title: string
  description: string
}> = [
  {
    id: 'signal',
    title: 'Centralt dashboard',
    description:
      'Kassör och styrelse ser alla kiosker, omsättning och transaktioner i samma vy.',
  },
  {
    id: 'poster',
    title: 'Automatisk QR-skylt',
    description:
      'En färdig skylt för mobil, surfplatta eller utskrift utan extra verktyg.',
  },
  {
    id: 'pricing',
    title: 'Export till bokföring',
    description:
      'CSV och SIE för Fortnox och Visma — per kiosk eller hela föreningen.',
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
    id: 'club',
    name: 'Klubblicens',
    price: CLUB_LICENSE_PRICE,
    description:
      'Hela föreningen — alla lag och kiosker. 14 dagars provperiod utan betalkort.',
    cta: TRIAL_LABEL,
    tracking: 'start-club-license',
    variant: 'primary',
  },
]

function Home() {
  useRecordPlatformVisit({ type: 'page_view', path: '/' })

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <MarketingHeader loginTracking="home-header-login" />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(26,115,232,0.04),_transparent_60%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6 sm:pb-20 sm:pt-8">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-4">
                <h1 className="text-pretty text-4xl font-bold leading-tight tracking-tight text-brand-foreground sm:text-5xl lg:text-6xl">
                  {SITE_TAGLINE}
                </h1>
                <p className="max-w-2xl text-pretty text-base text-brand-muted sm:text-lg">
                  Styrelse och kassör sätter upp kiosker för lag och cuper.
                  Kunderna betalar med Swish — ni får överblick och export.
                </p>
              </div>

              <MarketingCtas
                primaryTracking="primary-cta"
                secondaryTracking="home-demo-cta"
              />

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-brand-muted">
                <span className="premium-pill">{CLUB_LICENSE_PRICE}</span>
                <span className="premium-pill">Ingen app</span>
                <span className="premium-pill">Export CSV/SIE</span>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                    Så ser QRButik ut
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-lg border border-brand-border-accent bg-white ring-1 ring-brand/20">
                    <img
                      src="/after.jpg"
                      alt="Digital kiosk med meny"
                      className="h-40 w-full object-cover sm:h-44"
                    />
                    <div className="border-l-4 border-brand px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand">
                        Kundvy (live)
                      </p>
                      <p className="mt-1 text-sm text-brand-muted">
                        Prova demokiosken med korv, kaffe och vanliga artiklar.
                      </p>
                      <Link
                        to="/s/$shopSlug"
                        params={{ shopSlug: DEMO_SHOP_SLUG }}
                        className="mt-3 inline-flex cursor-pointer text-sm font-semibold text-brand underline decoration-brand-border underline-offset-4"
                        trackaton-on-click="home-hero-live-kiosk"
                      >
                        {LIVE_KIOSK_LABEL} →
                      </Link>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-brand-border bg-[#F8FAFC]">
                    <img
                      src="/admin-demo-dashboard.svg"
                      alt="Exempel på adminpanel med försäljningsöversikt"
                      className="h-40 w-full object-cover object-top sm:h-44"
                    />
                    <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
                      Adminvy (exempel)
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {heroKpis.map((kpi) => (
                    <div key={kpi.label} className="premium-kpi">
                      <p className="premium-kpi-label">{kpi.label}</p>
                      <p className="premium-kpi-value">{kpi.value}</p>
                    </div>
                  ))}
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
        <section className="flex flex-col gap-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
              För styrelse och kassör
            </p>
            <h2 className="mt-4 text-pretty text-3xl font-bold text-brand-foreground sm:text-4xl">
              Från kioskkaos till kontroll efter cupen.
            </h2>
            <p className="mt-3 text-base text-brand-muted sm:text-lg">
              Idrottsföreningar behöver både snabbare köer på plats och en tydlig
              ekonomiöverblick — utan Excel efter helgen.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            <div className="rounded-xl border border-brand-border bg-[#F8FAFC] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
                Utan digital kiosk
              </p>
              <ul className="mt-6 space-y-4">
                {comparisonRows.map((row) => (
                  <li key={row.problem} className="flex items-start gap-3 text-brand-muted">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-border bg-white"
                    >
                      <span className="h-0.5 w-3 rounded-full bg-brand-muted/70" />
                    </span>
                    <span className="text-sm sm:text-base">{row.problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-brand-border-accent bg-white p-6 shadow-sm ring-1 ring-brand/15 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                Med QRButik
              </p>
              <ul className="mt-6 space-y-4">
                {comparisonRows.map((row) => (
                  <li key={row.solution} className="flex items-start gap-3 text-brand-foreground">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-bg text-sm font-bold text-success"
                    >
                      ✓
                    </span>
                    <span className="text-sm font-medium sm:text-base">{row.solution}</span>
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
                  Klubblicens för föreningar.
                </h2>
                <p className="mt-4 text-sm text-brand-muted">
                  QRButik riktar sig till idrottsföreningar och cuparrangörer — inte
                  privatpersoner som säljer på loppis.
                </p>
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
                        to="/logga-in"
                        search={{ redirect: '/skapa' }}
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
                Logga in med e-post, skapa förening och lägg till kiosker i admin.
                Kunder behöver aldrig konto.
              </p>
            </div>
          </div>
        </section>

        <TimeSavingsCalculator />

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell flex flex-col items-center gap-6 text-center">
            <div className="max-w-2xl">
              <h2 className="text-pretty text-3xl font-bold text-brand-foreground">
                Redo att samla kiosken under samma tak?
              </h2>
              <p className="mt-3 text-base text-brand-muted">
                Starta provperiod eller boka demo — vi hjälper styrelse och kassör
                att komma igång.
              </p>
            </div>
            <MarketingCtas
              primaryTracking="landing-bottom-cta"
              secondaryTracking="landing-bottom-demo"
              layout="stack"
            />
          </div>
        </section>

        <MarketingFooter />
      </div>
    </main>
  )
}
