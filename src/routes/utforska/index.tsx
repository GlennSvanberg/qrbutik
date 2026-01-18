import { Link, createFileRoute } from '@tanstack/react-router'
import { getAllCities, getAllPseoPages, getAllSports } from '~/lib/pseo'

export const Route = createFileRoute('/utforska/')({
  head: () => ({
    meta: [
      {
        title: 'Utforska sport och stad | QRButik',
      },
      {
        name: 'description',
        content:
          'Hitta QRButik-lösningar för din sport och stad. Utforska fotboll, handboll och fler föreningar i Sverige.',
      },
      {
        property: 'og:title',
        content: 'Utforska sport och stad | QRButik',
      },
      {
        property: 'og:description',
        content:
          'Hitta QRButik-lösningar för din sport och stad. Utforska fotboll, handboll och fler föreningar i Sverige.',
      },
    ],
  }),
  component: DiscoverPage,
})

function DiscoverPage() {
  const pages = getAllPseoPages()
  const sports = getAllSports()
  const cities = getAllCities()
  const totalPages = pages.length

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.12),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-14 sm:pt-20">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Utforska QRButik
            </p>
            <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl">
              Hitta rätt kiosk för din sport och stad.
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
              Välj sport och stad för att se hur QRButik gör kiosken snabbare,
              tydligare och enklare att driva.
            </p>
          </div>

          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Sporter
              </p>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <span
                    key={sport.slug}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {sport.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Städer
              </p>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <span
                    key={city.slug}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {city.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
              {totalPages} kombinationer
            </span>
            <span>Välj sport och stad för att komma igång.</span>
          </div>
          <h2 className="text-pretty text-2xl font-semibold text-slate-900">
            Hitta rätt sida direkt
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.slug}
              to={page.slug}
              className="group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                <span>{page.city.region}</span>
                <span>{page.sport.name}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {page.sport.name} i {page.city.name}
              </h3>
              <p className="text-sm text-slate-600">
                Se hur QRButik gör kiosken snabbare för {page.sport.name.toLowerCase()} i {page.city.name}.
              </p>
              <span className="text-sm font-semibold text-indigo-700">
                Läs sidan →
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            Vill du starta kiosken direkt?
          </p>
          <Link
            to="/skapa"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            Skapa kiosk på 2 minuter
          </Link>
        </div>
      </section>
    </main>
  )
}
