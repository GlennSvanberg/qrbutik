import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/glenn')({
  head: () => ({
    meta: [
      {
        title: 'Glenn-demo – QRButik',
      },
      {
        name: 'description',
        content:
          'Detta är en demo av QRButik-checkout. Skapa din egen Swish-kiosk på 2 minuter.',
      },
    ],
  }),
  component: GlennDemoLanding,
})

function GlennDemoLanding() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="relaxed-surface p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Glenn-upplevelsen ar en demo
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Du har precis sett hur QRButik fungerar: valj varor, fa
            totalsumma, betala med Swish och fa ett kvitto.
          </p>
        </header>

        <section className="relaxed-surface border-amber-200 bg-amber-50/70 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Skapa din egen Swish-kiosk
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Perfekt for matcher, loppisar och foreningskiosker. Ingen app, inga
            abonnemang.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/skapa"
              className="relaxed-primary-button inline-flex h-12 items-center justify-center px-6 text-base font-semibold text-white"
              trackaton-on-click="glenn-landing-cta"
            >
              Skapa din kiosk
            </Link>
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: 'glenn' }}
              className="relaxed-secondary-button inline-flex h-12 items-center justify-center px-6 text-base font-semibold text-slate-700"
              trackaton-on-click="glenn-landing-back-demo"
            >
              Tillbaka till demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
