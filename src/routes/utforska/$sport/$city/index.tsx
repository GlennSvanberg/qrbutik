import { Link, createFileRoute } from '@tanstack/react-router'
import {
  getAllCities,
  getAllSports,
  getPseoCopy,
  getPseoSlug,
} from '~/lib/pseo'

export const Route = createFileRoute('/utforska/$sport/$city/')({
  head: ({ params }) => {
    const copy = getPseoCopy(params.sport, params.city)
    const title = copy
      ? `QR-kiosk för ${copy.sport.name} i ${copy.city.name} | QRButik`
      : 'QRButik | Digital kiosk för föreningar'
    const description = copy
      ? `${copy.sport.name} i ${copy.city.name}: snabb kiosk med Swish. Kortare köer, tydliga priser och smart rapport för föreningar.`
      : 'Skapa en digital kiosk på 2 minuter. Kunderna scannar, väljer varor och betalar direkt med Swish.'

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
      ],
    }
  },
  component: PseoPage,
})

function PseoPage() {
  const { sport, city } = Route.useParams()
  const copy = getPseoCopy(sport, city)

  if (!copy) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">
          Sidan hittades inte
        </h1>
        <p className="mt-3 text-slate-600">
          Vi kunde tyvärr inte hitta den kombinationen.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/utforska"
            trackaton-on-click="pseo-back-explore"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Till utforska
          </Link>
        </div>
      </main>
    )
  }

  const relatedCities = getAllCities().filter((item) => item.slug !== city)
  const relatedSports = getAllSports().filter((item) => item.slug !== sport)

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.12),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-14 sm:pt-20">
          <div className="flex flex-col gap-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              QRButik för {copy.sport.name.toLowerCase()}
            </p>
            <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl">
              QR-kiosk för {copy.sport.name} i {copy.city.name}
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
              {copy.intro}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                to="/skapa"
                trackaton-on-click="pseo-create-kiosk-hero"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Skapa kiosk för {copy.sport.name}
              </Link>
              <Link
                to="/utforska"
                trackaton-on-click="pseo-explore-more-hero"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
              >
                Utforska fler städer
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-500">
              <span>{copy.city.region}</span>
              <span>{copy.matchContext}</span>
              <span>Swish direkt</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
            <div className="flex flex-col justify-center gap-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src="/qrbutik_logo.png"
                    alt="QRButik logo"
                    className="h-10 w-auto"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Lokalt fokus
                  </p>
                </div>
                <h2 className="text-pretty text-3xl font-semibold text-slate-900">
                  Bygg en kiosk som matchar {copy.sport.name.toLowerCase()} i{' '}
                  {copy.city.name}.
                </h2>
              </div>
              <p className="text-base text-slate-600">
                {copy.sport.name} i {copy.city.name} betyder ofta{' '}
                {copy.crowdContext}. QRButik ger er en kiosk som håller tempot,
                även när trycket är som högst.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Stadens karaktär</p>
                <p className="mt-2">{copy.heritageText}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {copy.commonItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Varför det fungerar
              </p>
                <p className="mt-4 text-base text-slate-600">
                  Automatisk totalsumma, Swish direkt och tydlig rapport gör att
                  kiosken känns professionell utan extra administration.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                  Fokus på flödet
                </p>
                <p className="mt-4 text-base text-indigo-100">
                  {copy.sport.name} i {copy.city.name} kräver snabb logistik.
                  QRButik låter publiken göra beställningen själva.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-16">
        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-[0.6fr_0.4fr]">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Lokala behov
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Typiska tillfällen för {copy.sport.name.toLowerCase()} i{' '}
              {copy.city.name}.
            </h2>
            <p className="text-sm text-slate-600">
              {copy.matchContext} innebär ofta {copy.crowdContext}. Med QRButik
              blir kiosken redo innan publiken kommer.
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
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Säljtopp
            </p>
            <p className="mt-4 text-base text-slate-700">
              Vanliga storsäljare i {copy.city.name}:{' '}
              <span className="font-semibold text-slate-900">
                {copy.commonItems.join(', ')}
              </span>
              .
            </p>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Sportens flöde
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Så fungerar kiosken för {copy.sport.name.toLowerCase()}.
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              {copy.operationalNotes.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Stadens förutsättningar
            </p>
            <h3 className="text-pretty text-2xl font-semibold text-slate-900">
              {copy.city.name} i praktiken.
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {copy.localNotes.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
            <img
              src="/environment.jpg"
              alt={`Efter matchen i ${copy.city.name}`}
              className="h-64 w-full object-cover lg:h-full"
            />
            <div className="flex flex-col justify-center gap-3 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Efter matchen
              </p>
              <h3 className="text-pretty text-2xl font-semibold text-slate-900">
                Sammanställ försäljningen utan stress.
              </h3>
              <p className="text-sm text-slate-600">
                Efter matchen: sammanställ försäljningen vid bordet och få full
                koll på kiosken.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Spelmiljö
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Anpassat för {copy.sport.environment === 'indoor' ? 'hallen' : 'arenan'}.
            </h2>
            <p className="text-sm text-slate-600">
              {copy.environment.text}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Säsong
            </p>
            <h3 className="text-pretty text-2xl font-semibold text-slate-900">
              {copy.season.title}
            </h3>
            <p className="text-sm text-slate-600">{copy.season.text}</p>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          {copy.compare.map((block) => (
            <div key={block.title} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                {block.title}
              </p>
              <ul className="space-y-3 text-base text-slate-600">
                {block.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      •
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Fördelar
            </p>
            <h2 className="mt-4 text-pretty text-3xl font-semibold text-slate-900">
              Därför väljer {copy.sport.name} i {copy.city.name} QRButik.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {copy.benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-2 w-12 rounded-full bg-indigo-600" />
                <p className="text-base text-slate-700">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Så funkar det
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Klart för nästa {copy.sport.name.toLowerCase()}-match.
            </h2>
            <p className="text-sm text-slate-600">
              Snabbt att komma igång och lätt att återanvända.
            </p>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            {copy.steps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                    {index + 1}
                  </span>
                  {step.title}
                </div>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-[0.6fr_0.4fr]">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Kioskförslag
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Passar {copy.sport.name.toLowerCase()}-publiken i{' '}
              {copy.city.name}.
            </h2>
            <p className="text-sm text-slate-600">
              Vanliga kioskrätter för {copy.sport.name.toLowerCase()} i{' '}
              {copy.city.name}. Justera fritt utifrån säsong och behov.
            </p>
          </div>
          <ul className="grid gap-3 text-sm text-slate-600">
            {copy.commonItems.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="font-semibold text-slate-700">{item}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Populärt
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Vanliga frågor
            </p>
            <h2 className="text-pretty text-3xl font-semibold text-slate-900">
              Frågor från föreningar i {copy.city.name}.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {copy.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {item.question}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-pretty text-3xl font-semibold text-slate-900">
            {copy.closing}
          </h2>
          <p className="text-sm text-slate-600">
            Sätt upp kiosken inför nästa {copy.sport.name.toLowerCase()}-event i{' '}
            {copy.city.name} och låt publiken betala själva.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/skapa"
              trackaton-on-click="pseo-create-kiosk"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Skapa kiosk
            </Link>
            <Link
              to="/utforska"
              trackaton-on-click="pseo-explore-more"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Utforska fler städer
            </Link>
          </div>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Officiella länkar
            </p>
            <h3 className="text-pretty text-2xl font-semibold text-slate-900">
              {copy.city.name} kommun och besökssidor
            </h3>
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
        </section>
      </div>
    </main>
  )
}
