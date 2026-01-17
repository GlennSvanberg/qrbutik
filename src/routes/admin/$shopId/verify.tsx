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

export const Route = createFileRoute('/admin/$shopId/verify')({
  component: VerifyPage,
})

function VerifyPage() {
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

  return <VerifyContent email={session.user.email} />
}

function VerifyContent({ email }: { email: string }) {
  const { shopId } = Route.useParams()
  if (!shopId) {
    return null
  }
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const { data: transactions } = useSuspenseQuery(
    convexQuery(api.transactions.listTodayByShop, { shopId: shopIdParam }),
  )
  const verifyTransaction = useMutation(api.transactions.verify)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pendingTransactions = useMemo(
    () =>
      transactions.filter((transaction) => transaction.status === 'pending'),
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
          section="verify"
          shopName={shop.name}
        />

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Väntar på verifiering
            </h2>
            <span className="text-xs text-slate-500">
              {pendingTransactions.length} betalningar
            </span>
          </div>

          <div className="divide-y divide-slate-200/70">
            {pendingTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Inga betalningar att verifiera just nu.
              </div>
            ) : (
              pendingTransactions.map((transaction) => (
                <div key={transaction._id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {transaction.reference}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.createdAt).toLocaleTimeString(
                          'sv-SE',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900">
                        {transaction.amount} kr
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
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
                        className="cursor-pointer rounded-xl bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                      >
                        Verifiera
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {transaction.items
                      .map((item) => `${item.quantity}x ${item.name}`)
                      .join(' · ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
      </div>
      <AdminBottomNav shopId={shopIdParam} active="verify" />
    </main>
  )
}
