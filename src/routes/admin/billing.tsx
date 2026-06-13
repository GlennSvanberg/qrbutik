import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery as useTanstackQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useAction, useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { daysUntil } from '../../lib/billing'
import type { Id } from '../../../convex/_generated/dataModel'

type BillingSearch = {
  organizationId?: string
  success?: string
  canceled?: string
  invoice?: string
}

export const Route = createFileRoute('/admin/billing')({
  validateSearch: (search: Record<string, unknown>): BillingSearch => ({
    organizationId:
      typeof search.organizationId === 'string'
        ? search.organizationId
        : undefined,
    success: typeof search.success === 'string' ? search.success : undefined,
    canceled: typeof search.canceled === 'string' ? search.canceled : undefined,
    invoice: typeof search.invoice === 'string' ? search.invoice : undefined,
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
  const {
    organizationId: organizationIdFromSearch,
    success,
    canceled,
    invoice,
  } = Route.useSearch()
  const { data: organizations, isPending: isOrganizationsPending } =
    useTanstackQuery(convexQuery(api.organizations.getMyOrganizations, {}))
  const organizationFromSearch = useQuery(
    api.organizations.getOrganization,
    organizationIdFromSearch
      ? { organizationId: organizationIdFromSearch as Id<'organizations'> }
      : 'skip',
  )
  const stripeConfigured = useQuery(api.organizations.isStripeConfigured, {})

  const orgList = organizations ?? []

  const resolvedOrganizations =
    orgList.length > 0
      ? orgList
      : organizationFromSearch
        ? [organizationFromSearch]
        : []

  const isResolvingOrganization =
    resolvedOrganizations.length === 0 &&
    (isOrganizationsPending ||
      (organizationIdFromSearch && organizationFromSearch === undefined))

  if (isResolvingOrganization) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-2xl flex-col gap-4 p-8 text-center">
          <p className="text-sm text-slate-600">Laddar förening...</p>
        </div>
      </main>
    )
  }

  if (resolvedOrganizations.length === 0) {
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
    resolvedOrganizations.some(
      (org: { _id: string }) => org._id === organizationIdFromSearch,
    )
      ? (organizationIdFromSearch as Id<'organizations'>)
      : resolvedOrganizations[0]._id

  return (
    <BillingContent
      organizations={resolvedOrganizations}
      initialOrganizationId={initialOrgId}
      stripeConfigured={stripeConfigured?.configured ?? false}
      success={success === '1'}
      canceled={canceled === '1'}
      invoiceSuccess={invoice === '1'}
    />
  )
}

function BillingContent({
  organizations,
  initialOrganizationId,
  stripeConfigured,
  success,
  canceled,
  invoiceSuccess,
}: {
  organizations: Array<{
    _id: Id<'organizations'>
    name: string
    subscriptionStatus: string
    trialEndsAt?: number
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    role: 'owner' | 'treasurer' | 'editor'
  }>
  initialOrganizationId: Id<'organizations'>
  stripeConfigured: boolean
  success: boolean
  canceled: boolean
  invoiceSuccess: boolean
}) {
  const [organizationId, setOrganizationId] =
    useState<Id<'organizations'>>(initialOrganizationId)
  const createCheckoutSession = useAction(api.stripeActions.createCheckoutSession)
  const createInvoiceSubscription = useAction(
    api.stripeActions.createInvoiceSubscription,
  )
  const createPortalSession = useAction(
    api.stripeActions.createCustomerPortalSession,
  )
  const updateOrganizationSettings = useMutation(
    api.orgDashboard.updateOrganizationSettings,
  )
  const generateLogoUploadUrl = useMutation(
    api.orgDashboard.generateLogoUploadUrl,
  )
  const organizationDetails = useQuery(api.organizations.getOrganization, {
    organizationId,
  })
  const logoUrl = useQuery(api.orgDashboard.getOrganizationLogoUrl, {
    organizationId,
  })
  const [orgNumber, setOrgNumber] = useState('')
  const [sieRevenueAccount, setSieRevenueAccount] = useState('')
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null)

  const activeOrg = useMemo(
    () =>
      organizations.find((org) => org._id === organizationId) ?? organizations[0],
    [organizationId, organizations],
  )

  const canManageBilling =
    activeOrg.role === 'owner' || activeOrg.role === 'treasurer'

  const trialDaysLeft = daysUntil(activeOrg.trialEndsAt)
  const hasPaidSubscription =
    activeOrg.subscriptionStatus === 'active' &&
    Boolean(activeOrg.stripeSubscriptionId)
  const hasBillingSetup = Boolean(activeOrg.stripeSubscriptionId)
  const canActivate =
    stripeConfigured &&
    !hasPaidSubscription &&
    !hasBillingSetup &&
    activeOrg.subscriptionStatus !== 'canceled'
  const needsPaymentUrgently =
    activeOrg.subscriptionStatus === 'past_due' ||
    (activeOrg.subscriptionStatus === 'inactive' &&
      activeOrg.trialEndsAt !== undefined &&
      activeOrg.trialEndsAt < Date.now())

  useEffect(() => {
    if (!organizationDetails) {
      return
    }
    setOrgNumber(organizationDetails.orgNumber ?? '')
    setSieRevenueAccount(organizationDetails.sieRevenueAccount ?? '3010')
  }, [organizationDetails])

  const trialCopy =
    activeOrg.subscriptionStatus === 'trialing' && trialDaysLeft !== null
      ? trialDaysLeft > 0
        ? `${trialDaysLeft} dag${trialDaysLeft === 1 ? '' : 'ar'} kvar av provperioden.`
        : 'Provperioden slutar idag.'
      : activeOrg.trialEndsAt
        ? `Provperiod gällde till ${new Date(activeOrg.trialEndsAt).toLocaleDateString('sv-SE')}.`
        : 'Ingen aktiv provperiod.'

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              QRButik.se
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Klubblicens &amp; fakturering
            </h1>
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
        {invoiceSuccess || invoiceMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {invoiceMessage ??
              'Fakturering är aktiverad. Faktura skickas till föreningens faktura-e-post.'}
          </p>
        ) : null}
        {canceled ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Checkout avbröts. Du kan försöka igen när du vill.
          </p>
        ) : null}
        {needsPaymentUrgently ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {activeOrg.subscriptionStatus === 'past_due'
              ? 'Betalningen misslyckades. Kiosker kan pausas tills betalningen är reglerad.'
              : 'Provperioden är slut. Aktivera klubblicensen för att fortsätta ta emot köp.'}
          </p>
        ) : null}
        {hasPaidSubscription ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Klubblicensen är aktiv. Hantera kort, fakturor och uppsägning via
            kundportalen.
          </p>
        ) : null}
        {!hasPaidSubscription && hasBillingSetup ? (
          <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Betalning är konfigurerad. Kiosker fortsätter under provperioden;
            debitering sker enligt vald metod (kort eller faktura).
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
                från 995 kr/mån
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
              <p className="mt-2 text-sm text-slate-600">{trialCopy}</p>
            </div>
          </div>

          {!canManageBilling ? (
            <p className="text-sm text-slate-600">
              Endast kassör eller huvudansvarig kan hantera fakturering. Kontakta
              föreningens owner.
            </p>
          ) : null}

          {canManageBilling ? (
            <div className="flex flex-col gap-3">
              {canActivate ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isLoadingCheckout}
                    onClick={async () => {
                      setError(null)
                      setInvoiceMessage(null)
                      setIsLoadingCheckout(true)
                      try {
                        const result = await createCheckoutSession({
                          organizationId,
                        })
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
                    {isLoadingCheckout ? 'Öppnar...' : 'Betala med kort'}
                  </button>
                  <button
                    type="button"
                    disabled={isLoadingInvoice}
                    onClick={async () => {
                      setError(null)
                      setInvoiceMessage(null)
                      setIsLoadingInvoice(true)
                      try {
                        const result = await createInvoiceSubscription({
                          organizationId,
                        })
                        setInvoiceMessage(result.message)
                      } catch (invoiceError) {
                        setError(
                          invoiceError instanceof Error
                            ? invoiceError.message
                            : 'Kunde inte aktivera fakturering.',
                        )
                      } finally {
                        setIsLoadingInvoice(false)
                      }
                    }}
                    className="relaxed-secondary-button h-12 cursor-pointer px-6 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoadingInvoice ? 'Aktiverar...' : 'Betala med faktura'}
                  </button>
                </div>
              ) : null}

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
                className="relaxed-secondary-button h-12 w-fit cursor-pointer px-6 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingPortal ? 'Öppnar...' : 'Hantera prenumeration'}
              </button>

              {canActivate ? (
                <p className="text-sm text-slate-500">
                  Kortbetalning via Stripe Checkout. Faktura skickas som PDF till
                  faktura-e-post — passar kassörer utan föreningskort.
                </p>
              ) : null}
            </div>
          ) : null}

          {!stripeConfigured ? (
            <p className="text-sm text-slate-500">
              Stripe är inte konfigurerat ännu. Kör{' '}
              <code className="rounded bg-stone-100 px-1">npm run stripe:setup</code>{' '}
              och starta{' '}
              <code className="rounded bg-stone-100 px-1">npm run stripe:listen</code>{' '}
              under utveckling.
            </p>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </section>

        {canManageBilling ? (
          <section className="relaxed-surface flex flex-col gap-4 p-8">
            <h2 className="text-base font-semibold text-slate-900">
              Föreningslogotyp (QR-skylt)
            </h2>
            <p className="text-sm text-slate-600">
              Valfri logotyp som visas på alla kioskers QR-skyltar. PNG eller JPG,
              max 500 KB. Kvadratisk bild rekommenderas.
            </p>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${activeOrg.name} logotyp`}
                className="mx-auto h-24 w-24 rounded-2xl border border-stone-200 object-contain p-2"
              />
            ) : null}
            <div className="flex flex-wrap gap-3">
              <label className="relaxed-secondary-button inline-flex h-11 cursor-pointer items-center px-4 text-sm font-semibold text-slate-700">
                {isUploadingLogo ? 'Laddar upp…' : 'Ladda upp logotyp'}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  disabled={isUploadingLogo}
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (!file) {
                      return
                    }
                    setError(null)
                    setSettingsMessage(null)
                    if (
                      file.type !== 'image/png' &&
                      file.type !== 'image/jpeg'
                    ) {
                      setError('Endast PNG och JPG stöds.')
                      return
                    }
                    if (file.size > 500_000) {
                      setError('Logotypen får vara max 500 KB.')
                      return
                    }
                    setIsUploadingLogo(true)
                    try {
                      const uploadUrl = await generateLogoUploadUrl({
                        organizationId,
                      })
                      const response = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': file.type },
                        body: file,
                      })
                      if (!response.ok) {
                        throw new Error('Uppladdningen misslyckades.')
                      }
                      const payload = (await response.json()) as {
                        storageId: Id<'_storage'>
                      }
                      await updateOrganizationSettings({
                        organizationId,
                        logoStorageId: payload.storageId,
                      })
                      setSettingsMessage('Logotypen sparades.')
                    } catch (uploadError) {
                      setError(
                        uploadError instanceof Error
                          ? uploadError.message
                          : 'Kunde inte ladda upp logotypen.',
                      )
                    } finally {
                      setIsUploadingLogo(false)
                    }
                  }}
                />
              </label>
              {logoUrl ? (
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={async () => {
                    setError(null)
                    setIsUploadingLogo(true)
                    try {
                      await updateOrganizationSettings({
                        organizationId,
                        logoStorageId: null,
                      })
                      setSettingsMessage('Logotypen togs bort.')
                    } catch (removeError) {
                      setError(
                        removeError instanceof Error
                          ? removeError.message
                          : 'Kunde inte ta bort logotypen.',
                      )
                    } finally {
                      setIsUploadingLogo(false)
                    }
                  }}
                  className="relaxed-secondary-button h-11 cursor-pointer px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ta bort logotyp
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {canManageBilling ? (
          <section className="relaxed-surface flex flex-col gap-4 p-8">
            <h2 className="text-base font-semibold text-slate-900">
              Bokföring &amp; SIE-export
            </h2>
            <p className="text-sm text-slate-600">
              Används när du exporterar SIE från dashboarden. Standardkonto 3010
              om inget annat anges.
            </p>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault()
                setSettingsMessage(null)
                setError(null)
                setIsSavingSettings(true)
                try {
                  await updateOrganizationSettings({
                    organizationId,
                    orgNumber,
                    sieRevenueAccount,
                  })
                  setSettingsMessage('Inställningarna sparades.')
                } catch (settingsError) {
                  setError(
                    settingsError instanceof Error
                      ? settingsError.message
                      : 'Kunde inte spara inställningarna.',
                  )
                } finally {
                  setIsSavingSettings(false)
                }
              }}
            >
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Organisationsnummer
                <input
                  value={orgNumber}
                  onChange={(event) => setOrgNumber(event.target.value)}
                  placeholder="556677-8899"
                  className="relaxed-input h-11 px-3"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                Intäktskonto (SIE)
                <input
                  value={sieRevenueAccount}
                  onChange={(event) => setSieRevenueAccount(event.target.value)}
                  placeholder="3010"
                  className="relaxed-input h-11 px-3"
                />
              </label>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="relaxed-secondary-button h-11 w-fit cursor-pointer px-5 text-sm font-semibold text-slate-700 sm:col-span-2"
              >
                {isSavingSettings ? 'Sparar…' : 'Spara exportinställningar'}
              </button>
            </form>
            {settingsMessage ? (
              <p className="text-sm text-emerald-700">{settingsMessage}</p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  )
}
