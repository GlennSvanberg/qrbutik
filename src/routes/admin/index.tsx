import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { SignOutButton } from '../../components/auth/ShopAccessGate'
import { authClient } from '../../lib/authClient'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

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

const subscriptionLabel: Record<string, string> = {
  trialing: 'Provperiod',
  active: 'Aktiv licens',
  past_due: 'Förfallen',
  canceled: 'Avslutad',
  inactive: 'Inaktiv',
}

function AdminDashboard() {
  const { data: session } = authClient.useSession()
  const email = session?.user.email ?? ''
  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )

  if (organizations.length === 0) {
    return (
      <main className="relaxed-page-shell min-h-screen bg-transparent">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">
              Föreningens kiosker
            </h1>
            <p className="text-sm text-slate-600">
              Inloggad som <span className="font-medium">{email}</span>
            </p>
          </header>
          <div className="relaxed-surface rounded-3xl border-dashed p-10 text-center">
            <p className="text-sm text-slate-600">
              Du har ingen förening kopplad till ditt konto ännu.
            </p>
            <Link
              to="/skapa"
              className="relaxed-primary-button mt-4 inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
            >
              Skapa förening
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return <AdminDashboardWithOrganizations email={email} organizations={organizations} />
}

function AdminDashboardWithOrganizations({
  email,
  organizations,
}: {
  email: string
  organizations: Array<{
    _id: Id<'organizations'>
    name: string
    subscriptionStatus: string
    role: 'owner' | 'treasurer' | 'editor'
  }>
}) {
  const [selectedOrgId, setSelectedOrgId] = useState<Id<'organizations'>>(
    organizations[0]._id,
  )

  const activeOrg =
    organizations.find((org) => org._id === selectedOrgId) ?? organizations[0]

  const { data: shops } = useSuspenseQuery(
    convexQuery(api.organizations.listOrganizationShops, {
      organizationId: activeOrg._id,
    }),
  )

  const shopIds = useMemo(() => shops.map((shop) => shop._id), [shops])
  const { data: salesSummaries } = useSuspenseQuery(
    convexQuery(api.transactions.getSalesSummaryByShopIds, { shopIds }),
  )

  const salesByShop = useMemo(() => {
    return new Map(salesSummaries.map((summary) => [summary.shopId, summary]))
  }, [salesSummaries])

  const licenseActive =
    activeOrg.subscriptionStatus === 'trialing' ||
    activeOrg.subscriptionStatus === 'active'

  const canManageBilling =
    activeOrg.role === 'owner' || activeOrg.role === 'treasurer'

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="relative overflow-hidden border-b border-stone-200/70 bg-stone-50/80 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(146,116,84,0.14),_transparent_65%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              QRButik.se
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold text-slate-900">
                  Föreningens kiosker
                </h1>
                <p className="text-sm text-slate-600">
                  Inloggad som <span className="font-medium">{email}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/admin/skapa-kiosk"
                  search={{ organizationId: activeOrg._id }}
                  className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
                >
                  Skapa kiosk
                </Link>
                {canManageBilling ? (
                  <Link
                    to="/admin/billing"
                    search={{ organizationId: activeOrg._id }}
                    className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-slate-700"
                  >
                    Fakturering
                  </Link>
                ) : null}
                <Link
                  to="/skapa"
                  className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-slate-700"
                >
                  Skapa förening
                </Link>
                <SignOutButton />
              </div>
            </div>
          </header>

          {organizations.length > 1 ? (
            <label className="flex max-w-md flex-col gap-2 text-sm text-slate-700">
              Välj förening
              <select
                value={selectedOrgId}
                onChange={(event) =>
                  setSelectedOrgId(event.target.value as Id<'organizations'>)
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

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="relaxed-chip px-3 py-1">{activeOrg.name}</span>
            <span className="relaxed-chip px-3 py-1">
              {subscriptionLabel[activeOrg.subscriptionStatus] ??
                activeOrg.subscriptionStatus}
            </span>
            <span className="relaxed-chip px-3 py-1">
              {shops.length} kiosk{shops.length === 1 ? '' : 'er'}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        {shops.length === 0 ? (
          <div className="relaxed-surface rounded-3xl border-dashed p-10 text-center">
            <p className="text-sm text-slate-600">
              Inga kiosker i den här föreningen ännu.
            </p>
            <Link
              to="/admin/skapa-kiosk"
              search={{ organizationId: activeOrg._id }}
              className="relaxed-primary-button mt-4 inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
            >
              Skapa kiosk
            </Link>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            {shops.map((shop) => {
              const summary = salesByShop.get(shop._id)
              const latestSaleAt = summary?.latestSaleAt ?? null
              const latestSaleAmount = summary?.latestSaleAmount ?? null
              const totalRevenue = summary?.totalRevenue ?? 0

              return (
                <article
                  key={shop._id}
                  className="relaxed-surface flex h-full flex-col gap-5 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {shop.name}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        licenseActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {licenseActive ? 'Öppen' : 'Stängd'}
                    </span>
                  </div>

                  <div className="grid gap-3 text-center sm:grid-cols-2">
                    <div className="relaxed-surface-soft bg-stone-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Total försäljning
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {formatCurrency(totalRevenue)}
                      </p>
                    </div>
                    <div className="relaxed-surface-soft bg-stone-50/70 p-4">
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
                      className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
                    >
                      Hantera kiosk
                    </Link>
                    {licenseActive ? (
                      <Link
                        to="/s/$shopSlug"
                        params={{ shopSlug: shop.slug }}
                        className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-slate-700"
                      >
                        Besök kiosk
                      </Link>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
