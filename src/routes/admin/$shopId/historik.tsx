import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { authClient } from '../../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../../lib/devMagicLink'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/historik')({
  component: PurchaseHistoryPage,
})

function PurchaseHistoryPage() {
  const { data: session, isPending, error } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  if (isPending) {
    return (
      <main className="min-h-screen px-6 py-10">
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
      <main className="min-h-screen px-6 py-10">
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

  return <PurchaseHistoryContent email={session.user.email} />
}

function PurchaseHistoryContent({ email }: { email: string }) {
  const params = Route.useParams()
  if (!('shopId' in params)) {
    return null
  }
  const shopIdParam = params.shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const { data: transactions } = useSuspenseQuery(
    convexQuery(api.transactions.listByShop, { shopId: shopIdParam }),
  )
  const verifyTransaction = useMutation(api.transactions.verify)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null)

  const pendingTransactions = useMemo(
    () =>
      transactions.filter((transaction) => transaction.status === 'pending'),
    [transactions],
  )

  const formattedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        formattedDate: new Date(transaction.createdAt).toLocaleDateString(
          'sv-SE',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          },
        ),
        formattedTime: new Date(transaction.createdAt).toLocaleTimeString(
          'sv-SE',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
      })),
    [transactions],
  )

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-10">
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
      <main className="min-h-screen px-6 py-10">
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

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-28 pt-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AdminHeader
          ownerEmail={email}
          shopId={shop._id}
          section="history"
          shopName={shop.name}
          subtitle="Köphistorik"
        />

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Alla köp
              </h2>
              <p className="text-xs text-slate-500">
                Full historik med möjlighet att verifiera betalningar.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {pendingTransactions.length} väntar på verifiering
            </span>
          </div>

          <div className="divide-y divide-slate-200/70 rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Verifiera</span>
              <span>Datum &amp; referens</span>
              <span className="text-right">Summa</span>
            </div>
            {formattedTransactions.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Inga köp registrerade ännu.
              </div>
            ) : (
              formattedTransactions.map((transaction) => {
                const isExpanded = expandedTransactionId === transaction._id
                return (
                  <div key={transaction._id} className="px-4 py-4 transition">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setExpandedTransactionId((prev) =>
                          prev === transaction._id ? null : transaction._id,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setExpandedTransactionId((prev) =>
                            prev === transaction._id ? null : transaction._id,
                          )
                        }
                      }}
                      className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 text-left"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300">
                        <input
                          type="checkbox"
                          checked={transaction.status === 'verified'}
                          disabled={transaction.status === 'verified'}
                          onClick={(event) => event.stopPropagation()}
                          onChange={async () => {
                            setError(null)
                            setStatusMessage(null)
                            try {
                              await verifyTransaction({
                                transactionId: transaction._id,
                              })
                              setStatusMessage('Betalning verifierad.')
                            } catch (verifyError) {
                              if (verifyError instanceof Error) {
                                setError(verifyError.message)
                              } else {
                                setError('Något gick fel. Försök igen.')
                              }
                            }
                          }}
                          className="h-4 w-4 cursor-pointer accent-indigo-700"
                        />
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          {transaction.formattedDate} ·{' '}
                          {transaction.formattedTime}
                          {transaction.status === 'pending' ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              Väntar
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Verifierad
                            </span>
                          )}
                        </span>
                      </span>

                      <span className="text-right text-lg font-semibold text-slate-900">
                        {transaction.amount} kr
                      </span>
                    </div>
                    {isExpanded ? (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Varor
                        </p>
                        <div className="mt-2 flex flex-col gap-1">
                          {transaction.items.map((item) => (
                            <div
                              key={`${transaction._id}-${item.name}`}
                              className="flex items-center justify-between"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>
                                {Math.round(
                                  item.price * item.quantity,
                                ).toLocaleString('sv-SE')}{' '}
                                kr
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
      </div>
      <AdminBottomNav shopId={shopIdParam} active="history" />
    </main>
  )
}
