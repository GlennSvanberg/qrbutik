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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.12),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 sm:pt-20">
          <div className="flex flex-col gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <img
                src="/qrbutik_logo.png"
                alt="QRButik logo"
                className="h-16 w-auto sm:h-20"
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
            <p className="mx-auto max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
              {copy.intro}
            </p>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                to="/skapa"
                trackaton-on-click="pseo-create-kiosk-hero"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Skapa din Swish-kiosk &mdash; 10 kr
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
                <span className="text-slate-300">·</span>
                <Link
                  to="/utforska"
                  className="cursor-pointer font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                  trackaton-on-click="pseo-explore-more-hero"
                >
                  Utforska fler sporter &amp; städer
                </Link>
              </div>
              <p className="text-xs text-slate-500">
                Vi mejlar en inloggning. Klicka i mejlet s&aring; &auml;r du inne.
              </p>
          </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>{copy.city.region}</span>
              <span>{copy.matchContext}</span>
              <span>Swish direkt</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="flex flex-col justify-center gap-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Före och efter
                </p>
                <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                  Byt handskrivet mot en kiosk som säljer sig själv i{' '}
                  {copy.city.name}.
                </h2>
              </div>
              <p className="text-base text-slate-600">
                {copy.sport.name} i {copy.city.name} innebär ofta {copy.crowdContext}. Visa en
                tydlig digital meny och låt publiken betala direkt med Swish.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                  <span>Före</span>
                  <span>Handskrivet</span>
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/before.jpg"
                    alt="Handskriven prislista"
                    className="h-56 w-full object-cover sm:h-64"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                  <span>Efter</span>
                  <span>Digital meny</span>
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="/after.jpg"
                    alt="Digital kiosk med meny"
                    className="h-56 w-full object-cover sm:h-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-16">
        <section className="grid gap-12 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Vanliga problem
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              {copy.problems.title}
            </h2>
            <p className="text-sm text-slate-600">
              {copy.matchContext} i {copy.city.name} betyder ofta {copy.crowdContext}. När
              trycket stiger blir handskrivet och huvudräkning en flaskhals.
            </p>
            <ul className="space-y-4 text-base text-slate-600">
              {copy.problems.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                    ✗
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
            <ul className="space-y-4 text-base text-slate-600">
              {copy.solution.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                    ✓
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Fördelar
            </p>
            <h2 className="mt-4 text-pretty text-3xl font-semibold text-slate-900">
              Allt som behövs för en modern kiosk.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Snabbare kö
                </h3>
                <p className="mt-2 text-sm text-slate-600">{copy.benefits[0]}</p>
              </div>
            </div>

            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Ingen huvudräkning
                </h3>
                <p className="mt-2 text-sm text-slate-600">{copy.benefits[1]}</p>
              </div>
            </div>

            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Enkel avstämning
                </h3>
                <p className="mt-2 text-sm text-slate-600">{copy.benefits[2]}</p>
              </div>
            </div>

            <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Tydlig överblick
                </h3>
                <p className="mt-2 text-sm text-slate-600">{copy.benefits[4]}</p>
              </div>
            </div>
          </div>
        </section>

        <TimeSavingsCalculator
          title={`Hur mycket tid kan ${copy.sport.name} i ${copy.city.name} spara?`}
          subtitle="En enkel uppskattning för hur mycket smidigare kiosken blir när publiken beställer själva."
        />

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Lokalt fokus
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Kioskflöde för {copy.sport.name.toLowerCase()} i {copy.city.name}.
            </h2>
            <p className="text-sm text-slate-600">
              {copy.sport.name} i {copy.city.name} betyder ofta {copy.crowdContext}. QRButik
              hjälper er hålla tempot — från första beställningen till sista avstämningen.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Stadens karaktär</p>
              <p className="mt-2">{copy.heritageText}</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Så funkar det i praktiken
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {copy.operationalNotes.concat(copy.localNotes).map((note) => (
                  <li key={note} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600">
                      •
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  {copy.environment.title}
                </p>
                <p className="mt-3 text-sm text-slate-600">{copy.environment.text}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  {copy.season.title}
                </p>
                <p className="mt-3 text-sm text-slate-600">{copy.season.text}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Vanliga tillfällen
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {copy.useCases.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Storsäljare: <span className="font-semibold text-slate-700">{copy.commonItems.join(', ')}</span>.
              </p>
            </div>

            {copy.officialLinks.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Officiella länkar
                </p>
                <div className="flex flex-wrap gap-3">
                  {copy.officialLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Funktioner
            </p>
            <h2 className="mt-4 text-pretty text-3xl font-semibold text-slate-900">
              Verktygen som gör det enkelt.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 4v4h4" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Automatisk QR-skylt
              </h3>
              <p className="text-sm text-slate-600">
                Vi genererar en proffsig QR-skylt. Perfekt att sätta upp vid {copy.matchContext.toLowerCase()} i{' '}
                {copy.city.name}.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M6 12l4 4 8-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Admin-vy i realtid
              </h3>
              <p className="text-sm text-slate-600">
                Se inkommande köp direkt. Extra tryggt när trycket är högt och många vill handla snabbt.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Priser
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Inga abonnemang. Betala bara när ni säljer.
            </h2>
            <p className="text-sm text-slate-600">{copy.closing}</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">Event-pass</p>
                <p className="text-4xl font-semibold text-slate-900">10 kr</p>
              </div>
              <p className="text-sm text-slate-600">
                Gäller i 48 timmar. Perfekt för helgens {copy.sport.name.toLowerCase()}.
              </p>
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                trackaton-on-click="pseo-start-event-pass"
              >
                Starta event-pass
              </Link>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">Säsongs-pass</p>
                <p className="text-4xl font-semibold text-slate-900">99 kr</p>
              </div>
              <p className="text-sm text-slate-600">
                Gäller hela terminen (6 månader). Obegränsade ändringar.
              </p>
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                trackaton-on-click="pseo-start-season-pass"
              >
                Starta säsong
              </Link>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Ingen inloggning krävs för att börja. Ingen app att ladda ner.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <blockquote className="flex flex-col gap-4">
            <p className="text-pretty text-xl font-semibold text-slate-900">
              {copy.testimonial.quote}
            </p>
            <footer className="text-sm text-slate-500">
              {copy.testimonial.byline}
            </footer>
          </blockquote>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Fler städer
            </p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {copy.sport.name} i andra städer
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedCities.map((item) => (
                <Link
                  key={item.slug}
                  to={getPseoSlug(copy.sport.slug, item.slug)}
                  className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200"
                >
                  {copy.sport.name} i {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Fler sporter
            </p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {copy.city.name} för fler idrotter
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedSports.map((item) => (
                <Link
                  key={item.slug}
                  to={getPseoSlug(item.slug, copy.city.slug)}
                  className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200"
                >
                  {item.name} i {copy.city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </main>
  )
}
