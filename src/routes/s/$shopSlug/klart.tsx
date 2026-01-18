import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/s/$shopSlug/klart')({
  component: ShopActivationSuccessPage,
})

function ShopActivationSuccessPage() {
  const { shopSlug } = Route.useParams()
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopBySlug, { slug: shopSlug }),
  )

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller skapa en ny butik.
          </p>
          <Link
            to="/"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Till startsidan
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
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

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex flex-col gap-3">
            <Link
              to="/s/$shopSlug/qr"
              params={{ shopSlug: shop.slug }}
              className="cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Visa QR-kod
            </Link>
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: shop.slug }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Visa butik
            </Link>
            <Link
              to="/admin"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Adminpanel
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
