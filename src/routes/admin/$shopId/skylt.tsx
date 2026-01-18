import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { authClient } from '../../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../../lib/devMagicLink'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/skylt')({
  component: ShopQrPage,
})

function ShopQrPage() {
  const { data: session, isPending, error } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  if (isPending) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Laddar adminpanelen...
          </h1>
          <p className="text-sm text-slate-600">Kontrollerar din session.</p>
        </div>
      </main>
    )
  }

  if (!session?.user.email) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              QRButik.se
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Logga in till adminpanelen
            </h1>
            <p className="text-sm text-slate-600">
              Vi skickar en magic link till din e-postadress.
            </p>
          </header>

          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault()
              setStatusMessage(null)
              const trimmedEmail = email.trim()
              if (!trimmedEmail) {
                setStatusMessage('Fyll i en e-postadress.')
                return
              }
              setStatusMessage('Skickar inloggningslänk...')
              await authClient.signIn.magicLink(
                { email: trimmedEmail, callbackURL: '/admin' },
                {
                  onSuccess: async () => {
                    setStatusMessage(
                      isDevMagicLinkEnabled()
                        ? 'Devmode: öppnar magic link direkt.'
                        : 'Magic link skickad. Kolla inkorgen.',
                    )
                    await maybeOpenDevMagicLink(trimmedEmail)
                  },
                  onError: (ctx) =>
                    setStatusMessage(ctx.error.message || 'Något gick fel.'),
                },
              )
            }}
          >
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              E-post
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-indigo-500"
              />
            </label>
            <button
              type="submit"
              className="h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              trackaton-on-click="admin-login-magic-link"
            >
              Skicka magic link
            </button>
          </form>

          {statusMessage ? (
            <p className="text-sm text-slate-600">{statusMessage}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-rose-600">{error.message}</p>
          ) : null}
        </div>
      </main>
    )
  }

  return <ShopQrContent email={session.user.email} />
}

function ShopQrContent({ email }: { email: string }) {
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
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Butiken hittades inte
          </h1>
          <p className="text-sm text-slate-600">
            Kontrollera länken eller gå tillbaka till adminpanelen.
          </p>
          <Link
            to="/admin"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
            trackaton-on-click="admin-back-dashboard"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  if (shop.ownerEmail !== email) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Du har inte behörighet
          </h1>
          <p className="text-sm text-slate-600">
            Den här butiken är inte kopplad till din e-postadress.
          </p>
          <Link
            to="/admin"
            className="mx-auto w-fit cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white"
            trackaton-on-click="admin-back-dashboard"
          >
            Till adminpanelen
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
    <main className="min-h-screen bg-slate-50 px-6 pb-28 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0">
      <style>{`@page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { margin: 0; padding: 0; }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 print:hidden">
        <AdminHeader
          ownerEmail={email}
          shopId={shop._id}
          section="skylt"
          shopName={shop.name}
        />
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
              className="cursor-pointer rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              trackaton-on-click="admin-print-qr"
            >
              Skriv ut A4
            </button>
            <Link
              to="/s/$shopSlug/qr"
              params={{ shopSlug: shop.slug }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
              trackaton-on-click="admin-public-qr-page"
            >
              Publik QR-sida
            </Link>
          </div>
        </header>

        <section className="flex flex-col items-center gap-6 border-t border-slate-200 pt-6 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <QRCodeSVG value={qrValue} size={220} level="M" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-slate-900">
              Skanna för att handla i {shop.name}
            </p>
            <p className="text-sm text-slate-500">{displayUrl}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
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
          <div className="rounded-[44px] border border-slate-200 bg-white p-10">
            <QRCodeSVG value={qrValue} size={420} level="M" />
          </div>
          <div className="h-px w-40 bg-slate-200" />
        </div>
      </section>

      <div className="print:hidden">
        <AdminBottomNav shopId={shop._id} active="skylt" />
      </div>
    </main>
  )
}
