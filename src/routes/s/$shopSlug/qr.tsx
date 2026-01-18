import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo } from 'react'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/s/$shopSlug/qr')({
  component: ShopQrPublicPage,
})

function ShopQrPublicPage() {
  const { shopSlug } = Route.useParams()
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopBySlug, { slug: shopSlug }),
  )

  const origin = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.origin
  }, [])

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

  const qrValue = origin
    ? `${origin}/s/${shop.slug}`
    : `https://qrbutik.se/s/${shop.slug}`
  const displayUrl = `qrbutik.se/s/${shop.slug}`

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              QRButik.se
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              QR-kod till {shop.name}
            </h1>
          </div>
          <Link
            to="/admin"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600"
          >
            Admin
          </Link>
        </header>

        <section className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <QRCodeSVG value={qrValue} size={240} level="M" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-slate-900">
              Skanna för att handla
            </p>
            <p className="text-sm text-slate-500">{displayUrl}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: shop.slug }}
              className="cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Visa butik
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Skriv ut QR-kod
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
