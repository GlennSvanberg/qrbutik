import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo } from 'react'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/s/$shopSlug/qr')({
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
            trackaton-on-click="public-qr-back-home"
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
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 py-12">
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
            trackaton-on-click="public-qr-admin"
          >
            Admin
          </Link>
        </header>

        <section className="flex flex-col items-center">
          <div className="relaxed-surface flex flex-col items-center gap-6 p-8 text-center">
            <div className="relaxed-surface-soft rounded-3xl bg-amber-50/70 p-6">
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
                className="relaxed-primary-button cursor-pointer px-5 py-3 text-sm font-semibold text-white"
                trackaton-on-click="public-qr-view-shop"
              >
                Visa butik
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="relaxed-secondary-button cursor-pointer px-5 py-3 text-sm font-semibold text-slate-700"
                trackaton-on-click="public-qr-print"
              >
                Skriv ut QR-kod
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
