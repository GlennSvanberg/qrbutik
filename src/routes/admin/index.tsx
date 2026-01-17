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

  return <AdminDashboardContent email={session.user.email} />
}

function AdminDashboardContent({ email }: { email: string }) {
  const { data: shops } = useSuspenseQuery(
    convexQuery(api.shops.listByOwnerEmail, { ownerEmail: email }),
  )
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const origin = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.origin
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2 text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QRButik.se
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Din adminpanel
          </h1>
          <p className="text-sm text-slate-600">
            Inloggad som <span className="font-medium">{email}</span>
          </p>
        </header>

        <section className="flex flex-col gap-5 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Dina butiker
            </h2>
            <Link
              to="/skapa"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              Skapa ny butik
            </Link>
          </div>

          {shops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Ingen butik är kopplad till den här e-posten ännu.
            </div>
          ) : (
            <div className="divide-y divide-slate-200/70">
              {shops.map((shop) => {
                const shopUrl = origin
                  ? `${origin}/s/${shop.slug}`
                  : `/s/${shop.slug}`
                return (
                  <article key={shop._id} className="py-5">
                    <div className="flex flex-col gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {shop.name}
                        </h3>
                        <p className="text-sm text-slate-500">/s/{shop.slug}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to="/admin/$shopId"
                          params={{ shopId: shop._id }}
                          className="cursor-pointer rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
                        >
                          Öppna admin
                        </Link>
                        <Link
                          to="/admin/$shopId/qr"
                          params={{ shopId: shop._id }}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
                        >
                          QR + PDF
                        </Link>
                        <Link
                          to="/admin/$shopId/settings"
                          params={{ shopId: shop._id }}
                          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
                        >
                          Butiksinfo
                        </Link>
                      </div>

                      <div className="flex flex-col gap-2 text-xs text-slate-500">
                        <span>{shopUrl}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if ('clipboard' in navigator) {
                                await navigator.clipboard.writeText(shopUrl)
                                setCopyMessage('Butikslänk kopierad.')
                                return
                              }
                              window.prompt('Kopiera butikslänken:', shopUrl)
                              setCopyMessage('Butikslänk redo att kopieras.')
                            } catch {
                              setCopyMessage('Kunde inte kopiera länken.')
                            }
                          }}
                          className="w-fit cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                        >
                          Kopiera butikslänk
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {copyMessage ? (
          <p className="text-sm text-slate-500">{copyMessage}</p>
        ) : null}
      </div>
    </main>
  )
}
