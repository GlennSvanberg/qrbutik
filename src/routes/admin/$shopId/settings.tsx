import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { AdminBottomNav } from '../../../components/AdminBottomNav'
import { AdminHeader } from '../../../components/AdminHeader'
import { ButiksinfoForm } from '../../../components/ButiksinfoForm'
import type { Doc, Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const navigate = useNavigate()
  const { shopId } = Route.useParams()
  const shopIdParam = shopId as Id<'shops'>
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId: shopIdParam }),
  )

  if (!shop) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-2xl flex-col gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Kiosken hittades inte
          </h1>
          <Link
            to="/admin"
            className="relaxed-primary-button mx-auto w-fit cursor-pointer px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  return <SettingsContent shop={shop} navigate={navigate} />
}

function SettingsContent({
  shop,
  navigate,
}: {
  shop: Doc<'shops'>
  navigate: ReturnType<typeof useNavigate>
}) {
  const { data: organization } = useSuspenseQuery(
    convexQuery(api.organizations.getOrganization, {
      organizationId: shop.organizationId,
    }),
  )

  const updateShop = useMutation(api.shops.updateShop)
  const deleteShop = useMutation(api.shops.deleteShop)

  const [shopState, setShopState] = useState({
    name: '',
    swishNumber: '',
  })
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteShopName, setDeleteShopName] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setShopState({
      name: shop.name,
      swishNumber: shop.swishNumber,
    })
  }, [shop])

  const canSaveShop =
    shopState.name.trim() && shopState.swishNumber.trim()

  const licenseActive =
    organization.subscriptionStatus === 'trialing' ||
    organization.subscriptionStatus === 'active'

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent px-6 pb-28 pt-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <AdminHeader
          organizationId={shop.organizationId}
          shopId={shop._id}
          section="settings"
          shopName={shop.name}
        />
        <header className="flex flex-col gap-2 text-left">
          <p className="text-sm text-slate-600">
            {organization.name} · {shop.name} ·{' '}
            <span className="font-medium">/s/{shop.slug}</span>
          </p>
          {licenseActive ? (
            <Link
              to="/s/$shopSlug"
              params={{ shopSlug: shop.slug }}
              className="w-fit cursor-pointer text-sm font-semibold text-stone-700 hover:text-stone-600"
            >
              Öppna kiosken
            </Link>
          ) : null}
        </header>

        <section className="relaxed-divider flex flex-col gap-6 border-t pt-6">
          <h2 className="text-base font-semibold text-slate-900">Kioskinfo</h2>
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
                })
                setStatusMessage('Kioskinfo uppdaterad.')
              } catch (updateError) {
                setError(
                  updateError instanceof Error
                    ? updateError.message
                    : 'Något gick fel. Försök igen.',
                )
              }
            }}
            className="relaxed-primary-button h-12 cursor-pointer px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Spara kioskinfo
          </button>
        </section>

        <section className="relaxed-divider flex flex-col gap-4 border-t pt-6">
          <h2 className="text-base font-semibold text-slate-900">
            Föreningslicens
          </h2>
          <div className="relaxed-surface-soft bg-stone-50/70 px-5 py-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-slate-900">
                {organization.subscriptionStatus === 'trialing'
                  ? 'Provperiod'
                  : organization.subscriptionStatus === 'active'
                    ? 'Aktiv'
                    : 'Inaktiv'}
              </span>
            </div>
            {organization.trialEndsAt ? (
              <div className="mt-2 flex items-center justify-between">
                <span>Provperiod till</span>
                <span className="font-semibold text-slate-900">
                  {new Date(organization.trialEndsAt).toLocaleDateString('sv-SE')}
                </span>
              </div>
            ) : null}
            <p className="mt-3 text-xs text-slate-500">
              Betalning och fakturering hanteras på föreningsnivå. Stripe
              checkout kommer i nästa steg.
            </p>
          </div>
        </section>

        <section className="relaxed-divider flex flex-col gap-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-slate-900">
                Ta bort kiosk
              </h2>
              <p className="text-sm text-slate-600">
                Detta tar bort kiosken och all tillhörande data permanent.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDeleteOpen((prev) => !prev)
                setDeleteStatus(null)
                setDeleteError(null)
              }}
              className="relaxed-secondary-button h-12 cursor-pointer border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 hover:border-rose-300"
            >
              {isDeleteOpen ? 'Stäng' : 'Radera kiosk'}
            </button>
          </div>

          {isDeleteOpen ? (
            <div className="relaxed-surface-soft border-rose-200 bg-rose-50/60 px-5 py-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-rose-700">
                  Skriv kioskens namn exakt för att bekräfta borttagning.
                </p>
                <label className="flex flex-col gap-2 text-sm text-slate-700">
                  Bekräfta kiosknamn
                  <input
                    type="text"
                    value={deleteShopName}
                    onChange={(event) => setDeleteShopName(event.target.value)}
                    className="relaxed-input h-12 border-rose-200 bg-stone-50 px-4 text-base text-slate-900 outline-none focus:border-rose-400"
                    placeholder={shop.name}
                  />
                </label>
                <button
                  type="button"
                  disabled={deleteShopName.trim() !== shop.name}
                  onClick={async () => {
                    setDeleteStatus(null)
                    setDeleteError(null)
                    try {
                      await deleteShop({ shopId: shop._id })
                      setDeleteStatus('Kiosken är borttagen. Går tillbaka...')
                      setTimeout(() => {
                        void navigate({ to: '/admin' })
                      }, 1200)
                    } catch (deleteFailure) {
                      setDeleteError(
                        deleteFailure instanceof Error
                          ? deleteFailure.message
                          : 'Något gick fel. Försök igen.',
                      )
                    }
                  }}
                  className="relaxed-danger-button h-12 cursor-pointer px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  Ta bort kiosk permanent
                </button>
                {deleteStatus ? (
                  <p className="text-sm text-emerald-700">{deleteStatus}</p>
                ) : null}
                {deleteError ? (
                  <p className="text-sm text-rose-700">{deleteError}</p>
                ) : null}
              </div>
            </div>
          ) : null}
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
