import { Link, createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { authClient } from '../../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../../lib/devMagicLink'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/')({
  component: AdminShopDashboard,
})

type Period = 'today' | 'yesterday' | 'last7' | 'last30' | 'all'

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'Idag' },
  { value: 'yesterday', label: 'Igår' },
  { value: 'last7', label: '7 dagar' },
  { value: 'last30', label: '30 dagar' },
  { value: 'all', label: 'All tid' },
]

function AdminShopDashboard() {
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

  return <AdminShopContent email={session.user.email} />
}

function AdminShopContent({ email }: { email: string }) {
  const { shopId } = Route.useParams()
  if (!shopId) {
    return null
  }
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const [period, setPeriod] = useState<Period>('today')
  const { data: summary } = useQuery({
    ...convexQuery(api.transactions.getPeriodSummary, {
      shopId: shopIdParam,
      period,
    }),
    placeholderData: keepPreviousData,
  })

  if (!summary) {
    return null
  }

  const totalRevenue = summary.totalRevenue
  const transactionCount = summary.transactionCount
  const averageOrderValue = summary.averageOrderValue
  const lastSaleTime = summary.lastSaleTime
  const topItems = summary.topItems
  const recentSales = summary.recentSales

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
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  const formattedTotal = Math.round(totalRevenue).toLocaleString('sv-SE')
  const formattedAverage = Math.round(averageOrderValue).toLocaleString('sv-SE')
  const formattedLastSale = lastSaleTime
    ? new Date(lastSaleTime).toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-28 pt-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AdminHeader
          ownerEmail={email}
          shopId={shop._id}
          section="sales"
          shopName={shop.name}
        />

        <section className="flex flex-col gap-5 border-b border-slate-200 pb-6">
          <div className="flex items-center justify-center">
            <div className="grid w-full max-w-2xl grid-cols-5 gap-2 rounded-full border border-slate-200 bg-white p-1">
              {periodOptions.map((option) => {
                const isActive = period === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriod(option.value)}
                    className={`min-h-[2.5rem] w-full whitespace-nowrap rounded-full px-3 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Totalt
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formattedTotal} kr
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Betalningar
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {transactionCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Snittköp
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formattedAverage} kr
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Senaste köp
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formattedLastSale}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Topplista
            </h2>
            <span className="text-xs text-slate-500">Topp 5</span>
          </div>
          <div className="divide-y divide-slate-200/70 rounded-2xl border border-slate-200 bg-white px-4">
            {topItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Ingen försäljning ännu.
              </div>
            ) : (
              topItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-3 text-sm text-slate-700"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.quantity} st
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {Math.round(item.revenue).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Senaste köp
            </h2>
            <span className="text-xs text-slate-500">Realtid</span>
          </div>
          <div className="divide-y divide-slate-200/70 rounded-2xl border border-slate-200 bg-white px-4">
            {recentSales.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Inga köp ännu.
              </div>
            ) : (
              recentSales.map((sale) => (
                <div
                  key={sale._id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">
                      {new Date(sale.createdAt).toLocaleTimeString('sv-SE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sale.itemsCount} varor
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {Math.round(sale.amount).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <AdminBottomNav shopId={shopIdParam} active="sales" />
    </main>
  )
}
