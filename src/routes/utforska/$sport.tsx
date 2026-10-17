import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { MarketingFooter } from '~/components/MarketingFooter'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import { LIVE_KIOSK_LABEL, START_LABEL } from '~/lib/marketing'
import { getSport, sportPages } from '~/lib/sports'

export const Route = createFileRoute('/utforska/$sport')({
  beforeLoad: ({ params }) => {
    if (!getSport(params.sport)) {
      throw notFound()
    }
  },
  head: ({ params }) => {
    const sport = getSport(params.sport)
    if (!sport) {
      return {
        meta: [{ title: 'Sidan finns inte | QRButik' }],
      }
    }
    return {
      meta: [
        { title: sport.title },
        { name: 'description', content: sport.description },
        { name: 'robots', content: 'index, follow' },
      ],
    }
  },
  notFoundComponent: SportNotFound,
  component: SportPage,
})

function SportPage() {
  const { sport: slug } = Route.useParams()
  const sport = getSport(slug)
  if (!sport) {
    return null
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-muted">
            <Link to="/utforska" className="cursor-pointer underline decoration-brand-border underline-offset-4">
              Utforska
            </Link>
          </p>
          <h1 className="text-pretty text-4xl font-bold text-brand-foreground">
            {sport.h1}
          </h1>
        </header>

        {sport.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base text-brand-muted">
            {paragraph}
          </p>
        ))}

        <p className="text-sm text-brand-muted">
          Planer och priser finns på{' '}
          <Link
            to="/priser"
            className="cursor-pointer font-semibold text-brand-foreground underline decoration-brand-border underline-offset-4"
          >
            prissidan
          </Link>
          .
        </p>

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

        <nav aria-label="Andra sporter" className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-brand-foreground">Andra sporter</h2>
          <ul className="flex flex-wrap gap-3">
            {sportPages
              .filter((item) => item.slug !== sport.slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/utforska/$sport"
                    params={{ sport: item.slug }}
                    className="cursor-pointer text-sm font-semibold text-brand underline decoration-brand-border underline-offset-4"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
          <Link
            to="/utforska"
            className="cursor-pointer text-sm font-semibold text-brand-foreground underline decoration-brand-border underline-offset-4"
          >
            ← Alla sporter
          </Link>
        </nav>

        <MarketingFooter />
      </div>
    </main>
  )
}

function SportNotFound() {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-foreground">Sporten finns inte</h1>
        <p className="text-brand-muted">
          Den här sporten har ingen sida. Se de sporter som finns.
        </p>
        <Link
          to="/utforska"
          className="cursor-pointer font-semibold text-brand underline decoration-brand-border underline-offset-4"
        >
          Till alla sporter
        </Link>
      </div>
    </main>
  )
}
