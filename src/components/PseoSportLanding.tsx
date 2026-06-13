import { Link } from '@tanstack/react-router'
import type { getPseoSportCopy } from '~/lib/pseo'
import { MarketingCtas } from '~/components/MarketingCtas'
import { MarketingFooter } from '~/components/MarketingFooter'
import { TimeSavingsCalculator } from '~/components/TimeSavingsCalculator'
import { CLUB_LICENSE_PRICE } from '~/lib/marketing'
import { getAllSports, getPseoSportHubSlug } from '~/lib/pseo'

type SportCopy = NonNullable<ReturnType<typeof getPseoSportCopy>>

type PseoSportLandingProps = {
  copy: SportCopy
  pageUrl: string
  primaryTrackingPrefix?: string
}

export function PseoSportLanding({
  copy,
  pageUrl,
  primaryTrackingPrefix = 'pseo',
}: PseoSportLandingProps) {
  const relatedSports = getAllSports().filter(
    (item) => item.slug !== copy.sport.slug,
  )
  const sportLower = copy.sport.name.toLowerCase()

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(26,115,232,0.04),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-stone-50" />
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="flex flex-col gap-7">
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
                  Lösningar
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {copy.sport.name}
                </span>
              </nav>

              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Kiosksystem för {sportLower}föreningar
                </p>
                <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl">
                  Kiosksystem för föreningar inom {sportLower}
                </h1>
                <p className="max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                  {copy.intro}
                </p>
              </div>

              <MarketingCtas
                primaryTracking={`${primaryTrackingPrefix}-trial-hero`}
                secondaryTracking={`${primaryTrackingPrefix}-demo-hero`}
              />

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="premium-pill">{CLUB_LICENSE_PRICE}</span>
                <span className="premium-pill">{copy.matchContext}</span>
                <span className="premium-pill">Swish direkt</span>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Typisk matchsituation
                </p>
                <p className="text-sm text-slate-600">
                  Vid {copy.matchContext.toLowerCase()} och {copy.crowdContext}{' '}
                  behöver föreningen kiosker som kassören kan följa centralt.
                </p>
                <ul className="premium-divider-list text-sm text-slate-600">
                  {copy.commonItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
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
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Vanliga problem
              </p>
              <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                {copy.problems.title}
              </h2>
              <ul className="space-y-3 text-base text-slate-600">
                {copy.problems.bullets.map((point) => (
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
              <h3 className="text-pretty text-2xl font-semibold text-slate-900">
                {copy.solution.title}
              </h3>
              <ul className="premium-divider-list text-base text-slate-600">
                {copy.solution.bullets.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {copy.steps.map((step, idx) => (
            <div key={step.title} className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Steg 0{idx + 1}
                </span>
                <h2 className="text-xl font-semibold text-slate-900">
                  {step.title}
                </h2>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="premium-panel p-8">
            <div className="premium-shell flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                {copy.environment.title}
              </p>
              <p className="text-sm text-slate-600">{copy.environment.text}</p>
            </div>
          </div>
          <div className="premium-panel p-8">
            <div className="premium-shell flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                {copy.season.title}
              </p>
              <p className="text-sm text-slate-600">{copy.season.text}</p>
            </div>
          </div>
        </section>

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell grid gap-8 lg:grid-cols-2">
            {copy.compare.map((block) => (
              <div key={block.title} className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {block.title}
                </h2>
                <ul className="premium-divider-list text-sm text-slate-600">
                  {block.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <TimeSavingsCalculator />

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Klubblicens
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                {CLUB_LICENSE_PRICE}
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Hela föreningen — obegränsat antal kiosker. 14 dagars provperiod
                utan betalkort. Faktura eller kort via Stripe.
              </p>
            </div>
            <MarketingCtas
              primaryTracking={`${primaryTrackingPrefix}-trial-pricing`}
              secondaryTracking={`${primaryTrackingPrefix}-demo-pricing`}
              layout="stack"
            />
          </div>
        </section>

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Vanliga frågor om QRButik för {sportLower}
            </h2>
            <dl className="divide-y divide-stone-200">
              {copy.faq.map((item) => (
                <div key={item.question} className="py-5">
                  <dt className="font-semibold text-slate-900">{item.question}</dt>
                  <dd className="mt-2 text-sm text-slate-600">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {relatedSports.length > 0 ? (
          <section className="premium-panel p-8 sm:p-10">
            <div className="premium-shell">
              <h2 className="text-2xl font-semibold text-slate-900">
                Fler sporter
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedSports.map((sport) => (
                  <Link
                    key={sport.slug}
                    to={getPseoSportHubSlug(sport.slug)}
                    className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/90 px-4 py-3 transition hover:border-stone-300 hover:bg-stone-50"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      Föreningar inom {sport.name.toLowerCase()}
                    </span>
                    <span className="text-sm font-semibold text-stone-700 transition group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="premium-panel p-8 text-center">
          <div className="premium-shell flex flex-col items-center gap-4">
            <p className="text-sm text-slate-600">{copy.closing}</p>
            <MarketingCtas
              primaryTracking={`${primaryTrackingPrefix}-trial-footer`}
              secondaryTracking={`${primaryTrackingPrefix}-demo-footer`}
              layout="stack"
            />
          </div>
        </section>

        <MarketingFooter />
      </div>
      <span className="sr-only">{pageUrl}</span>
    </main>
  )
}
