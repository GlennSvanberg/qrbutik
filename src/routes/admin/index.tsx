import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { authClient } from '../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../lib/devMagicLink'

export const Route = createFileRoute('/admin/')({
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
  component: AdminDashboard,
})

function AdminDashboard() {
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
              Vi skickar ett inloggningsmejl till din e-postadress. Öppna mejlet så är du inne.
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
              setStatusMessage('Skickar inloggningsmejl...')
              await authClient.signIn.magicLink(
                { email: trimmedEmail, callbackURL: '/admin' },
                {
                  onSuccess: async () => {
                    setStatusMessage(
                      isDevMagicLinkEnabled()
                        ? 'Devmode: öppnar inloggningen direkt.'
                        : 'Inloggningsmejl skickat. Kolla inkorgen.',
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
              Skicka inloggningsmejl
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

  return <AdminDashboardContent email={session.user.email} />
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatSaleTime = (value: number) => {
  return new Intl.DateTimeFormat('sv-SE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function AdminDashboardContent({ email }: { email: string }) {
  const { data: shops } = useSuspenseQuery(
    convexQuery(api.shops.listByOwnerEmail, { ownerEmail: email }),
  )
  const shopIds = useMemo(() => shops.map((shop) => shop._id), [shops])
  const { data: salesSummaries } = useSuspenseQuery(
    convexQuery(api.transactions.getSalesSummaryByShopIds, { shopIds }),
  )

  const salesByShop = useMemo(() => {
    return new Map(salesSummaries.map((summary) => [summary.shopId, summary]))
  }, [salesSummaries])

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.12),_transparent_65%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              QRButik.se
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold text-slate-900">
                  Din adminpanel
                </h1>
                <p className="text-sm text-slate-600">
                  Inloggad som <span className="font-medium">{email}</span>
                </p>
              </div>
              <Link
                to="/skapa"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                trackaton-on-click="admin-create-shop"
              >
                Skapa ny butik
              </Link>
            </div>
          </header>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
              {shops.length} butiker kopplade
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
              Totalsiffror uppdateras i realtid
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Dina butiker
            </h2>
          </div>

          {shops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Ingen butik är kopplad till den här e-posten ännu.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {shops.map((shop) => {
                const summary = salesByShop.get(shop._id)
                const latestSaleAt = summary?.latestSaleAt ?? null
                const latestSaleAmount = summary?.latestSaleAmount ?? null
                const totalRevenue = summary?.totalRevenue ?? 0

                return (
                  <article
                    key={shop._id}
                    className="flex h-full flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {shop.name}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          shop.activationStatus === 'active'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {shop.activationStatus === 'active'
                          ? 'Aktiv'
                          : 'Inaktiv'}
                      </span>
                    </div>

                    <div className="grid gap-3 text-center sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Total försäljning
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {formatCurrency(totalRevenue)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Senaste köp
                        </p>
                        {latestSaleAt && latestSaleAmount !== null ? (
                          <div className="flex flex-col gap-1">
                            <p className="text-2xl font-semibold text-slate-900">
                              {formatCurrency(latestSaleAmount)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatSaleTime(latestSaleAt)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Ingen försäljning ännu
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap justify-center gap-2">
                      <Link
                        to="/admin/$shopId"
                        params={{ shopId: shop._id }}
                        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                        trackaton-on-click="admin-edit-shop"
                      >
                        Redigera butik
                      </Link>
                      {shop.activationStatus === 'active' ? (
                        <Link
                          to="/s/$shopSlug"
                          params={{ shopSlug: shop.slug }}
                          className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                          trackaton-on-click="admin-visit-shop"
                        >
                          Besök butik
                        </Link>
                      ) : (
                        <Link
                          to="/admin/$shopId/settings"
                          params={{ shopId: shop._id }}
                          className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
                          trackaton-on-click="admin-activate-shop"
                        >
                          Aktivera butik
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
