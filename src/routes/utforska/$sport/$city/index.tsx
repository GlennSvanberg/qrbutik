import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { TimeSavingsCalculator } from '~/components/TimeSavingsCalculator'
import {
  getAllCities,
  getAllSports,
  getPseoCopy,
  getPseoSlug,
} from '~/lib/pseo'

const SITE_URL =
  (import.meta as any).env.VITE_SITE_URL ?? 'https://qrbutik.se'

const buildAbsoluteUrl = (pathname: string) => {
  try {
    return new URL(pathname, SITE_URL).toString()
  } catch {
    return SITE_URL
  }
}

export const Route = createFileRoute('/utforska/$sport/$city/')({
  loader: ({ params }) => {
    const copy = getPseoCopy(params.sport, params.city)
    if (!copy) {
      throw notFound()
    }
    return copy
  },
  head: ({ loaderData, params }) => {
    const copy = loaderData ?? getPseoCopy(params.sport, params.city)
    if (!copy) {
      return {
        meta: [
          {
            title: 'Sidan hittades inte | QRButik',
          },
          {
            name: 'robots',
            content: 'noindex, nofollow',
          },
        ],
      }
    }

    const title = `QR-kiosk för ${copy.sport.name} i ${copy.city.name} | QRButik`
    const description = `${copy.sport.name} i ${copy.city.name}: snabb kiosk med Swish. Kortare köer, tydliga priser och smart rapport för föreningar.`
    const pageUrl = buildAbsoluteUrl(
      `/utforska/${copy.sport.slug}/${copy.city.slug}`,
    )

    return {
      meta: [
        {
          title,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:url',
          content: pageUrl,
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
        {
          name: 'robots',
          content:
            'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        },
        {
          'script:ld+json': {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': `${pageUrl}#webpage`,
                url: pageUrl,
                name: title,
                description,
                inLanguage: 'sv-SE',
              },
              {
                '@type': 'FAQPage',
                '@id': `${pageUrl}#faq`,
                mainEntity: copy.faq.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
              },
            ],
          },
        },
      ],
    }
  },
  component: PseoPage,
})

function PseoPage() {
  const copy = Route.useLoaderData()

  const relatedCities = getAllCities().filter(
    (item) => item.slug !== copy.city.slug,
  )
  const relatedSports = getAllSports().filter(
    (item) => item.slug !== copy.sport.slug,
  )
  const localFlowNotes = copy.operationalNotes.concat(copy.localNotes)
  const faqPreview = copy.faq.slice(0, 3)

  const heroFacts: Array<{ label: string; value: string }> = [
    { label: 'Region', value: copy.city.region },
    { label: 'Publik', value: copy.matchContext },
    { label: 'Storsäljare', value: copy.commonItems.slice(0, 2).join(', ') },
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
      description: `Gäller i 48 timmar. Perfekt för helgens ${copy.sport.name.toLowerCase()}.`,
      cta: 'Starta event-pass',
      tracking: 'pseo-start-event-pass',
      variant: 'primary',
    },
    {
      id: 'season',
      name: 'Säsongs-pass',
      price: '99 kr',
      description: 'Gäller i 6 månader och passar hela terminen.',
      cta: 'Starta säsong',
      tracking: 'pseo-start-season-pass',
      variant: 'secondary',
    },
  ]

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,88,12,0.14),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-amber-50" />
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
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    QRButik.se
                  </p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  För {copy.sport.name.toLowerCase()} i {copy.city.name}
                </p>
                <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl">
                  QR-kiosk för {copy.sport.name} i {copy.city.name}
                </h1>
                <p className="max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                  {copy.intro}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                  to="/skapa"
                  trackaton-on-click="pseo-create-kiosk-hero"
                  className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-white"
                >
                  Skapa din Swish-kiosk &mdash; 10 kr
                </Link>
                <Link
                  to="/utforska"
                  className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-6 text-base font-semibold text-slate-700"
                  trackaton-on-click="pseo-explore-more-hero"
                >
                  Utforska fler sporter och städer
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
                <span>Har du redan en kiosk?</span>
                <Link
                  to="/admin"
                  className="cursor-pointer font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                  trackaton-on-click="pseo-login-admin"
                >
                  Hantera den h&auml;r
                </Link>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  Vi mejlar en inloggning direkt till dig.
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="premium-pill">{copy.city.region}</span>
                <span className="premium-pill">{copy.matchContext}</span>
                <span className="premium-pill">Swish direkt</span>
              </div>
            </div>

            <div className="premium-panel p-6 sm:p-8">
              <div className="premium-shell flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Lokal kioskbild
                  </p>
                  <span className="premium-pill">{copy.city.name}</span>
                </div>
                <p className="text-sm text-slate-600">
                  {copy.sport.name} i {copy.city.name} innebär ofta{' '}
                  {copy.crowdContext}. QRButik ger ett tydligt flöde när trycket
                  stiger.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {heroFacts.map((fact) => (
                    <div key={fact.label} className="premium-kpi">
                      <p className="premium-kpi-label">{fact.label}</p>
                      <p className="premium-kpi-value text-base">{fact.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img
                      src="/before.jpg"
                      alt="Handskriven prislista"
                      className="h-44 w-full object-cover sm:h-48"
                    />
                    <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      F&ouml;re: handskrivet
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img
                      src="/after.jpg"
                      alt="Digital kiosk med meny"
                      className="h-44 w-full object-cover sm:h-48"
                    />
                    <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Efter: digital meny
                    </p>
                  </div>
                </div>

                <ul className="premium-divider-list text-sm text-slate-600">
                  <li>{copy.solution.bullets[0]}</li>
                  <li>{copy.solution.bullets[1]}</li>
                  <li>{copy.solution.bullets[2]}</li>
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
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Vanliga problem
              </p>
              <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                {copy.problems.title}
              </h2>
              <p className="text-sm text-slate-600">
                {copy.matchContext} i {copy.city.name} betyder ofta{' '}
                {copy.crowdContext}. N&auml;r trycket stiger blir handskrivet
                och huvudr&auml;kning en flaskhals.
              </p>
              <ul className="space-y-3 text-base text-slate-600">
                {copy.problems.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                      ✕
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Med QRButik
              </p>
              <h3 className="text-pretty text-2xl font-semibold text-slate-900">
                {copy.solution.title}
              </h3>
              <ul className="premium-divider-list text-base text-slate-600">
                {copy.solution.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                      ✓
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <ol className="mt-2 grid gap-3 sm:grid-cols-3">
                {copy.steps.map((step, idx) => (
                  <li
                    key={step.title}
                    className="rounded-xl border border-slate-200 bg-white/80 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Steg 0{idx + 1}
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Lokalt fokus
              </p>
              <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                Kioskflöde för {copy.sport.name.toLowerCase()} i {copy.city.name}.
              </h2>
              <p className="text-sm text-slate-600">
                {copy.sport.name} i {copy.city.name} betyder ofta{' '}
                {copy.crowdContext}. QRButik hjälper er hålla tempot från första
                beställningen till sista avstämningen.
              </p>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Stadens karaktär</p>
                <p className="mt-2">{copy.heritageText}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {copy.useCases.map((item) => (
                  <span
                    key={item}
                    className="premium-pill normal-case tracking-normal text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-500">
                Storsäljare:{' '}
                <span className="font-semibold text-slate-700">
                  {copy.commonItems.join(', ')}
                </span>
                .
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                I praktiken
              </p>
              <ul className="premium-divider-list text-sm text-slate-600">
                {localFlowNotes.map((note) => (
                  <li key={note} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      •
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {copy.environment.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {copy.environment.text}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {copy.season.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{copy.season.text}</p>
                </div>
              </div>

              {copy.officialLinks.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Officiella länkar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {copy.officialLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relaxed-secondary-button inline-flex h-10 cursor-pointer items-center justify-center px-4 text-xs font-semibold text-slate-700"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <TimeSavingsCalculator
          title={`Hur mycket tid kan ${copy.sport.name} i ${copy.city.name} spara?`}
          subtitle="En enkel uppskattning för hur mycket smidigare kiosken blir när publiken beställer själva."
        />

        <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="premium-panel p-8 sm:p-10">
            <div className="premium-shell flex h-full flex-col gap-7">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Funktioner
                </p>
                <h2 className="mt-4 text-pretty text-3xl font-semibold text-slate-900">
                  Verktygen som håller tempot i {copy.city.name}.
                </h2>
              </div>

              <ul className="premium-divider-list text-sm text-slate-600">
                <li>
                  <p className="font-semibold text-slate-900">
                    Automatisk QR-skylt
                  </p>
                  <p className="mt-1">
                    Sätt upp en proffsig QR-skylt vid{' '}
                    {copy.matchContext.toLowerCase()} i {copy.city.name}.
                  </p>
                </li>
                <li>
                  <p className="font-semibold text-slate-900">
                    Admin-vy i realtid
                  </p>
                  <p className="mt-1">
                    Se inkommande köp direkt och verifiera tryggt även när det
                    är mycket folk.
                  </p>
                </li>
                {copy.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Vanliga frågor
                </p>
                <div className="mt-4 space-y-4">
                  {faqPreview.map((item) => (
                    <div key={item.question}>
                      <p className="font-semibold text-slate-900">
                        {item.question}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="premium-panel p-8 sm:p-10">
            <div className="premium-shell flex h-full flex-col">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Priser
                </p>
                <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                  Inga abonnemang.
                </h2>
                <p className="text-sm text-slate-600">{copy.closing}</p>
              </div>

              <div className="mt-8 flex flex-1 flex-col gap-4">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-5"
                  >
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          {plan.name}
                        </p>
                        <p className="text-3xl font-semibold text-slate-900">
                          {plan.price}
                        </p>
                      </div>
                      <Link
                        to="/skapa"
                        className={
                          plan.variant === 'primary'
                            ? 'relaxed-primary-button inline-flex h-11 cursor-pointer items-center justify-center px-4 text-sm font-semibold text-white'
                            : 'relaxed-secondary-button inline-flex h-11 cursor-pointer items-center justify-center px-4 text-sm font-semibold text-slate-700'
                        }
                        trackaton-on-click={plan.tracking}
                      >
                        {plan.cta}
                      </Link>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {plan.description}
                    </p>
                  </div>
                ))}
              </div>

              <blockquote className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                <p className="text-pretty text-lg font-semibold text-slate-900">
                  {copy.testimonial.quote}
                </p>
                <footer className="mt-3 text-sm text-slate-500">
                  {copy.testimonial.byline}
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="premium-panel p-8 sm:p-10">
          <div className="premium-shell grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Fler städer
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {copy.sport.name} i andra städer
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedCities.map((item) => (
                  <Link
                    key={item.slug}
                    to={getPseoSlug(copy.sport.slug, item.slug)}
                    className="relaxed-secondary-button inline-flex h-10 cursor-pointer items-center justify-center px-4 text-xs font-semibold text-slate-700"
                  >
                    {copy.sport.name} i {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Fler sporter
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {copy.city.name} för fler idrotter
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedSports.map((item) => (
                  <Link
                    key={item.slug}
                    to={getPseoSlug(item.slug, copy.city.slug)}
                    className="relaxed-secondary-button inline-flex h-10 cursor-pointer items-center justify-center px-4 text-xs font-semibold text-slate-700"
                  >
                    {item.name} i {copy.city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </main>
  )
}
