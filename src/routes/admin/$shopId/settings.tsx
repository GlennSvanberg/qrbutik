import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { generateSwishLink } from '../../../lib/swish'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { ButiksinfoForm } from '../../../components/ButiksinfoForm'
import { authClient } from '../../../lib/authClient'
import {
  isDevMagicLinkEnabled,
  maybeOpenDevMagicLink,
} from '../../../lib/devMagicLink'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/settings')({
  component: SettingsPage,
})

function SettingsPage() {
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

  return <SettingsContent email={session.user.email} />
}

function SettingsContent({ email }: { email: string }) {
  const { shopId } = Route.useParams()
  if (!shopId) {
    return null
  }
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )
  const updateShop = useMutation(api.shops.updateShop)
  const activateShop = useMutation(api.shops.activateShop)
  const activationData = useQuery(api.shops.getActivationStatus, {
    shopId: shopIdParam,
  })

  const [shopState, setShopState] = useState({
    name: '',
    ownerEmail: '',
    swishNumber: '',
  })
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activationMessage, setActivationMessage] = useState<string | null>(
    null,
  )

  const timeLeftLabel = useMemo(() => {
    if (!activationData?.activeUntil) {
      return '—'
    }
    const remainingMs = activationData.activeUntil - Date.now()
    if (remainingMs <= 0) {
      return '0 dagar'
    }
    const hours = Math.floor(remainingMs / (60 * 60 * 1000))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (days === 0) {
      return `${remainingHours} timmar`
    }
    if (remainingHours === 0) {
      return `${days} dagar`
    }
    return `${days} dagar ${remainingHours} timmar`
  }, [activationData])

  useEffect(() => {
    if (!shop) {
      return
    }
    setShopState({
      name: shop.name,
      ownerEmail: shop.ownerEmail,
      swishNumber: shop.swishNumber,
    })
  }, [shop])

  const canSaveShop =
    shopState.name.trim() &&
    shopState.ownerEmail.trim() &&
    shopState.swishNumber.trim()

  if (!shop) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <AdminHeader
          ownerEmail={email}
          shopId={shop._id}
          section="settings"
          shopName={shop.name}
        />
        <header className="flex flex-col gap-2 text-left">
          <p className="text-sm text-slate-600">
            {shop.name} · <span className="font-medium">/s/{shop.slug}</span>
          </p>
          <Link
            to="/s/$shopSlug"
            params={{ shopSlug: shop.slug }}
            className="w-fit cursor-pointer text-sm font-semibold text-indigo-700 hover:text-indigo-600"
          >
            Öppna butiken
          </Link>
        </header>

        <section className="flex flex-col gap-6 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Butiksinfo
            </h2>
          </div>
          <ButiksinfoForm
            values={shopState}
            onChange={(values) => setShopState(values)}
          />
          <button
            type="button"
            disabled={!canSaveShop}
            onClick={async () => {
              setError(null)
              setStatusMessage(null)
              try {
                await updateShop({
                  shopId: shop._id,
                  name: shopState.name.trim(),
                  swishNumber: shopState.swishNumber.trim(),
                  ownerEmail: shopState.ownerEmail.trim(),
                })
                setStatusMessage('Butiksinfo uppdaterad.')
              } catch (updateError) {
                if (updateError instanceof Error) {
                  setError(updateError.message)
                } else {
                  setError('Något gick fel. Försök igen.')
                }
              }
            }}
            className="h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            Spara butiksinfo
          </button>
        </section>

        <section className="flex flex-col gap-6 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-900">
              Aktivering
            </h2>
            <p className="text-sm text-slate-600">
              Aktivera butiken via Swish. Betalningen markerar butiken som aktiv
              direkt.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-slate-900">
                {activationData?.activationStatus === 'active'
                  ? 'Aktiv'
                  : 'Inaktiv'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Plan</span>
              <span className="font-semibold text-slate-900">
                {activationData?.activationPlan === 'season'
                  ? 'Säsong (180 dagar)'
                  : activationData?.activationPlan === 'event'
                    ? 'Event (48 timmar)'
                    : 'Ingen plan'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Aktiv till</span>
              <span className="font-semibold text-slate-900">
                {activationData?.activeUntil
                  ? new Date(activationData.activeUntil).toLocaleString('sv-SE')
                  : '—'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Tid kvar</span>
              <span className="font-semibold text-slate-900">
                {timeLeftLabel}
              </span>
            </div>
          </div>

          {activationMessage ? (
            <p className="text-sm text-emerald-700">{activationMessage}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={async () => {
                const result = await activateShop({
                  shopId: shop._id,
                  plan: 'event',
                })
                const link = generateSwishLink(
                  '0735029113',
                  result.amount,
                  result.message,
                )
                setActivationMessage('Event aktiverad. Öppnar Swish...')
                window.location.href = link
              }}
              className="h-12 cursor-pointer rounded-xl bg-indigo-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Aktivera event 10 kr
            </button>
            <button
              type="button"
              onClick={async () => {
                const result = await activateShop({
                  shopId: shop._id,
                  plan: 'season',
                })
                const link = generateSwishLink(
                  '0735029113',
                  result.amount,
                  result.message,
                )
                setActivationMessage('Säsong aktiverad. Öppnar Swish...')
                window.location.href = link
              }}
              className="h-12 cursor-pointer rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Aktivera säsong 99 kr
            </button>
          </div>
        </section>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
      </div>
      <AdminBottomNav shopId={shop._id} active="settings" />
    </main>
  )
}
