import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/s/$shopSlug/klart')({
  head: () => ({
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  headers: () => ({
    'X-Robots-Tag': 'noindex, nofollow',
  }),
  component: ShopActivationSuccessPage,
})

function ShopActivationSuccessPage() {
  const { shopSlug } = Route.useParams()
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopBySlug, { slug: shopSlug }),
  )

  if (!shop) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller skapa en ny butik.
          </p>
          <Link
            to="/"
            className="relaxed-primary-button mx-auto w-fit cursor-pointer px-5 py-3 text-sm font-semibold text-white"
            trackaton-on-click="activation-back-home"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {shop.name} ar aktiverad
          </h1>
          <p className="text-sm text-slate-600">Vad vill du gora nu?</p>
        </header>

        <section className="relaxed-surface flex flex-col gap-4 p-8 text-center">
          <div className="flex flex-col gap-3">
            <Link
              to="/s/$shopSlug/qr"
              params={{ shopSlug: shop.slug }}
              className="relaxed-primary-button cursor-pointer px-5 py-3 text-sm font-semibold text-white"
              trackaton-on-click="activation-view-qr"
            >
              Visa QR-kod
            </Link>
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: shop.slug }}
              className="relaxed-secondary-button cursor-pointer px-5 py-3 text-sm font-semibold text-slate-700"
              trackaton-on-click="activation-view-shop"
            >
              Visa butik
            </Link>
            <Link
              to="/admin"
              className="relaxed-secondary-button cursor-pointer px-5 py-3 text-sm font-semibold text-slate-700"
              trackaton-on-click="activation-admin"
            >
              Adminpanel
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
