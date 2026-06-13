import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/skylt')({
  component: ShopQrPage,
})

function ShopQrPage() {
  const { shopId } = Route.useParams()
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )

  const origin = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.origin
  }, [])

  if (!shop) {
    return null
  }

  const qrValue = origin
    ? `${origin}/s/${shop.slug}`
    : `https://qrbutik.se/s/${shop.slug}`
  const displayUrl = `qrbutik.se/s/${shop.slug}`

  return (
    <>
      <style>{`@page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { margin: 0; padding: 0; }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 print:hidden">
        <header className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Skylt för {shop.name}
          </h2>
          <p className="text-sm text-slate-600">
            Skriv ut skylten och låt kunderna skanna QR-koden.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="relaxed-primary-button cursor-pointer px-4 py-2 text-sm font-semibold text-white"
              trackaton-on-click="admin-print-qr"
            >
              Skriv ut A4
            </button>
            <Link
              to="/s/$shopSlug/qr"
              params={{ shopSlug: shop.slug }}
              className="relaxed-secondary-button cursor-pointer px-4 py-2 text-sm font-semibold text-slate-700"
              trackaton-on-click="admin-public-qr-page"
            >
              Publik QR-sida
            </Link>
          </div>
        </header>

        <section className="relaxed-divider flex flex-col items-center gap-6 border-t pt-6 text-center">
          <div className="relaxed-surface p-6">
            <QRCodeSVG value={qrValue} size={220} level="M" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-slate-900">
              Skanna för att handla i {shop.name}
            </p>
            <p className="text-sm text-slate-500">{displayUrl}</p>
          </div>
          <div className="relaxed-surface-soft flex flex-col gap-2 px-6 py-4 text-sm text-slate-600">
            <p>1. Skanna QR-koden med mobilkamera.</p>
            <p>2. Lägg varor i varukorgen.</p>
            <p>3. Betala direkt med Swish.</p>
          </div>
        </section>
      </div>

      <section className="hidden min-h-[297mm] w-[210mm] flex-col items-center justify-between gap-12 px-[22mm] py-[24mm] text-center print:flex">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[13px] font-semibold uppercase tracking-[0.5em] text-slate-400">
            qrbutik.se
          </span>
          <h1 className="text-5xl font-semibold text-slate-900">{shop.name}</h1>
          <p className="text-lg font-semibold text-slate-600">{displayUrl}</p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="rounded-[44px] border border-stone-200 bg-stone-50 p-10">
            <QRCodeSVG value={qrValue} size={420} level="M" />
          </div>
          <div className="h-px w-40 bg-slate-200" />
        </div>
      </section>
    </>
  )
}
