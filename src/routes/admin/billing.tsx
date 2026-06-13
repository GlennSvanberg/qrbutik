import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useAction, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { SignOutButton } from '../../components/auth/ShopAccessGate'
import type { Id } from '../../../convex/_generated/dataModel'

type BillingSearch = {
  organizationId?: string
  success?: string
  canceled?: string
}

export const Route = createFileRoute('/admin/billing')({
  validateSearch: (search: Record<string, unknown>): BillingSearch => ({
    organizationId:
      typeof search.organizationId === 'string'
        ? search.organizationId
        : undefined,
    success: typeof search.success === 'string' ? search.success : undefined,
    canceled: typeof search.canceled === 'string' ? search.canceled : undefined,
  }),
  component: BillingPage,
})

const subscriptionLabel: Record<string, string> = {
  trialing: 'Provperiod',
  active: 'Aktiv licens',
  past_due: 'Förfallen betalning',
  canceled: 'Avslutad',
  inactive: 'Inaktiv',
}

function BillingPage() {
  const { organizationId: organizationIdFromSearch, success, canceled } =
    Route.useSearch()
  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )
  const stripeConfigured = useQuery(api.organizations.isStripeConfigured, {})

  if (organizations.length === 0) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-2xl flex-col gap-4 p-8 text-center">
          <p className="text-sm text-slate-600">
            Du behöver en förening innan du kan hantera fakturering.
          </p>
          <Link
            to="/skapa"
            className="relaxed-primary-button mx-auto inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
          >
            Skapa förening
          </Link>
        </div>
      </main>
    )
  }

  const initialOrgId =
    organizationIdFromSearch &&
    organizations.some((org) => org._id === organizationIdFromSearch)
      ? (organizationIdFromSearch as Id<'organizations'>)
      : organizations[0]._id

  return (
    <BillingContent
      organizations={organizations}
      initialOrganizationId={initialOrgId}
      stripeConfigured={stripeConfigured?.configured ?? false}
      success={success === '1'}
      canceled={canceled === '1'}
    />
  )
}

function BillingContent({
  organizations,
  initialOrganizationId,
  stripeConfigured,
  success,
  canceled,
}: {
  organizations: Array<{
    _id: Id<'organizations'>
    name: string
    subscriptionStatus: string
    trialEndsAt?: number
    stripeCustomerId?: string
    role: 'owner' | 'treasurer' | 'editor'
  }>
  initialOrganizationId: Id<'organizations'>
  stripeConfigured: boolean
  success: boolean
  canceled: boolean
}) {
  const [organizationId, setOrganizationId] =
    useState<Id<'organizations'>>(initialOrganizationId)
  const createCheckoutSession = useAction(api.stripeActions.createCheckoutSession)
  const createPortalSession = useAction(
    api.stripeActions.createCustomerPortalSession,
  )
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeOrg = useMemo(
    () =>
      organizations.find((org) => org._id === organizationId) ?? organizations[0],
    [organizationId, organizations],
  )

  const canManageBilling =
    activeOrg.role === 'owner' || activeOrg.role === 'treasurer'

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              QRButik.se
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Klubblicens &amp; fakturering
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin"
              className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-slate-700"
            >
              Till admin
            </Link>
            <SignOutButton />
          </div>
        </header>

        {organizations.length > 1 ? (
          <label className="flex max-w-md flex-col gap-2 text-sm text-slate-700">
            Förening
            <select
              value={organizationId}
              onChange={(event) =>
                setOrganizationId(event.target.value as Id<'organizations'>)
              }
              className="relaxed-input h-12 cursor-pointer px-4 text-base text-slate-900 outline-none"
            >
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {success ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Betalningen är registrerad. Det kan ta någon minut innan status
            uppdateras.
          </p>
        ) : null}
        {canceled ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Checkout avbröts. Du kan försöka igen när du vill.
          </p>
        ) : null}

        <section className="relaxed-surface flex flex-col gap-5 p-8">
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="relaxed-chip px-3 py-1">{activeOrg.name}</span>
            <span className="relaxed-chip px-3 py-1">
              {subscriptionLabel[activeOrg.subscriptionStatus] ??
                activeOrg.subscriptionStatus}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relaxed-surface-soft bg-stone-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Pris
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                995 kr/mån
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Obegränsat antal kiosker under samma förening.
              </p>
            </div>
            <div className="relaxed-surface-soft bg-stone-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Provperiod
              </p>
              {activeOrg.trialEndsAt ? (
                <p className="mt-1 text-sm text-slate-700">
                  Gäller till{' '}
                  <span className="font-semibold">
                    {new Date(activeOrg.trialEndsAt).toLocaleDateString('sv-SE')}
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-600">Ingen aktiv provperiod</p>
              )}
              <p className="mt-2 text-sm text-slate-600">
                Just nu krävs inget betalkort — lägg till betalning när Stripe är
                aktiverat.
              </p>
            </div>
          </div>

          {!canManageBilling ? (
            <p className="text-sm text-slate-600">
              Endast kassör eller huvudansvarig kan hantera fakturering. Kontakta
              föreningens owner.
            </p>
          ) : null}

          {canManageBilling ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!stripeConfigured || isLoadingCheckout}
                onClick={async () => {
                  setError(null)
                  setIsLoadingCheckout(true)
                  try {
                    const result = await createCheckoutSession({ organizationId })
                    window.location.href = result.url
                  } catch (checkoutError) {
                    setError(
                      checkoutError instanceof Error
                        ? checkoutError.message
                        : 'Kunde inte starta checkout.',
                    )
                  } finally {
                    setIsLoadingCheckout(false)
                  }
                }}
                className="relaxed-primary-button h-12 cursor-pointer px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingCheckout ? 'Öppnar...' : 'Lägg till betalning'}
              </button>
              <button
                type="button"
                disabled={
                  !stripeConfigured ||
                  !activeOrg.stripeCustomerId ||
                  isLoadingPortal
                }
                onClick={async () => {
                  setError(null)
                  setIsLoadingPortal(true)
                  try {
                    const result = await createPortalSession({ organizationId })
                    window.location.href = result.url
                  } catch (portalError) {
                    setError(
                      portalError instanceof Error
                        ? portalError.message
                        : 'Kunde inte öppna kundportalen.',
                    )
                  } finally {
                    setIsLoadingPortal(false)
                  }
                }}
                className="relaxed-secondary-button h-12 cursor-pointer px-6 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingPortal ? 'Öppnar...' : 'Hantera prenumeration'}
              </button>
            </div>
          ) : null}

          {!stripeConfigured ? (
            <p className="text-sm text-slate-500">
              Stripe är inte konfigurerat ännu. Betalningsknappar aktiveras när
              STRIPE_SECRET_KEY och STRIPE_PRICE_ID finns i miljön.
            </p>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </section>
      </div>
    </main>
  )
}
