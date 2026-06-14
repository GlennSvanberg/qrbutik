import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import {
  buildDashboardFilter,
  getDateRangeForPeriod,
  isTreasurerRole,
} from '../lib/adminDashboard'
import { AdminDashboardFilters } from './AdminDashboardFilters'
import { AdminExportPanel } from './AdminExportPanel'
import type { DashboardPeriod } from '../lib/adminDashboard'
import type { Id } from '../../convex/_generated/dataModel'

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

type ShopCardData = {
  shopId: Id<'shops'>
  shopName: string
  teamLabel: string | null
  licenseActive: boolean
  periodRevenue: number
  todayRevenue: number
  weekendRevenue: number
  transactionCount?: number
  latestSaleAt: number | null
  latestSaleAmount: number | null
}

type AdminOrgDashboardProps = {
  email: string
  organizationId: Id<'organizations'>
  organizations: Array<{
    _id: Id<'organizations'>
    name: string
    subscriptionStatus: string
    role: 'owner' | 'treasurer' | 'editor'
  }>
}

export function AdminOrgDashboard({
  email,
  organizationId,
  organizations,
}: AdminOrgDashboardProps) {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<DashboardPeriod>('last7')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [selectedShopId, setSelectedShopId] = useState<Id<'shops'> | 'all'>(
    'all',
  )

  const activeOrg =
    organizations.find((org) => org._id === organizationId) ?? organizations[0]
  const isTreasurer = isTreasurerRole(activeOrg.role)

  const { data: shops } = useSuspenseQuery(
    convexQuery(api.organizations.listOrganizationShops, {
      organizationId: activeOrg._id,
    }),
  )

  const filter = buildDashboardFilter(period, customStart, customEnd)
  const { start, end } = getDateRangeForPeriod(period, customStart, customEnd)

  const dashboardQueryArgs = {
    organizationId: activeOrg._id,
    filter,
    shopId: selectedShopId === 'all' ? undefined : selectedShopId,
  }

  const { data: dashboard } = useQuery({
    ...convexQuery(
      api.orgDashboard.getOrganizationDashboardSummary,
      dashboardQueryArgs,
    ),
    enabled: isTreasurer && shops.length > 0,
  })

  const { data: editorSummaries } = useQuery({
    ...convexQuery(api.orgDashboard.getEditorShopSummaries, {
      organizationId: activeOrg._id,
    }),
    enabled: !isTreasurer && shops.length > 0,
  })

  const licenseActive =
    activeOrg.subscriptionStatus === 'trialing' ||
    activeOrg.subscriptionStatus === 'active'

  const shopCards: Array<ShopCardData> = isTreasurer
    ? (dashboard?.shops ?? []).map((shop) => ({
        shopId: shop.shopId,
        shopName: shop.shopName,
        teamLabel: shop.teamLabel,
        licenseActive: shop.licenseActive,
        periodRevenue: shop.periodRevenue,
        todayRevenue: shop.todayRevenue,
        weekendRevenue: shop.weekendRevenue,
        transactionCount: shop.transactionCount,
        latestSaleAt: shop.latestSaleAt,
        latestSaleAmount: shop.latestSaleAmount,
      }))
    : (editorSummaries ?? shops.map((shop) => ({
        shopId: shop._id,
        shopName: shop.name,
        teamLabel: shop.teamLabel ?? null,
        licenseActive,
        periodRevenue: 0,
        todayRevenue: 0,
        weekendRevenue: 0,
        latestSaleAt: null,
        latestSaleAmount: null,
      })))

  const singleAssignedShop =
    activeOrg.role === 'editor' && shops.length === 1 ? shops[0] : null

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="nav-bar relative overflow-hidden border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-subtle">
              QRButik.se
            </p>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-brand-foreground">
                {isTreasurer ? 'Centralt dashboard' : 'Dina kiosker'}
              </h1>
              <p className="text-sm text-brand-muted">
                Inloggad som <span className="font-medium">{email}</span>
              </p>
            </div>
          </header>

          {organizations.length > 1 ? (
            <label className="flex max-w-md flex-col gap-2 text-sm text-brand-muted">
              Välj förening
              <select
                value={activeOrg._id}
                onChange={(event) => {
                  const nextOrgId = event.target.value as Id<'organizations'>
                  void navigate({
                    to: '/admin/org/$orgId',
                    params: { orgId: nextOrgId },
                  })
                }}
                className="relaxed-input h-12 cursor-pointer px-4 text-base text-brand-foreground outline-none"
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-3 text-sm text-brand-muted">
            <span className="relaxed-chip px-3 py-1">{activeOrg.name}</span>
            <span className="relaxed-chip px-3 py-1">
              {subscriptionLabel[activeOrg.subscriptionStatus] ??
                activeOrg.subscriptionStatus}
            </span>
            <span className="relaxed-chip px-3 py-1">
              {shops.length} kiosk{shops.length === 1 ? '' : 'er'}
            </span>
          </div>

          {singleAssignedShop ? (
            <Link
              to="/admin/$shopId"
              params={{ shopId: singleAssignedShop._id }}
              className="relaxed-primary-button inline-flex h-12 w-fit cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
            >
              Gå till din kiosk
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        {isTreasurer && shops.length > 0 ? (
          <>
            <AdminDashboardFilters
              period={period}
              onPeriodChange={setPeriod}
              customStart={customStart}
              customEnd={customEnd}
              onCustomStartChange={setCustomStart}
              onCustomEndChange={setCustomEnd}
              shopId={selectedShopId}
              shopOptions={shops}
              onShopChange={setSelectedShopId}
            />

            {dashboard ? (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="relaxed-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                    Omsättning
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-brand-foreground">
                    {formatCurrency(dashboard.totalRevenue)}
                  </p>
                </div>
                <div className="relaxed-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                    Antal köp
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-brand-foreground">
                    {dashboard.transactionCount}
                  </p>
                </div>
                <div className="relaxed-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                    Snittorder
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-brand-foreground">
                    {formatCurrency(dashboard.averageOrderValue)}
                  </p>
                </div>
                <div className="relaxed-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                    Senaste köp
                  </p>
                  <p className="mt-2 text-lg font-semibold text-brand-foreground">
                    {dashboard.lastSaleTime
                      ? formatSaleTime(dashboard.lastSaleTime)
                      : 'Ingen försäljning'}
                  </p>
                </div>
              </section>
            ) : null}

            {dashboard && dashboard.topItems.length > 0 ? (
              <section className="relaxed-surface p-5">
                <h2 className="text-base font-semibold text-brand-foreground">
                  Toppartiklar
                </h2>
                <ul className="mt-4 divide-y divide-brand-border/70">
                  {dashboard.topItems.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="font-medium text-brand-foreground">
                        {item.name}
                      </span>
                      <span className="text-brand-muted">
                        {item.quantity} st · {formatCurrency(item.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {dashboard && dashboard.recentSales.length > 0 ? (
              <section className="relaxed-surface p-5">
                <h2 className="text-base font-semibold text-brand-foreground">
                  Senaste köp
                </h2>
                <ul className="mt-4 divide-y divide-brand-border/70">
                  {dashboard.recentSales.map((sale) => (
                    <li
                      key={sale._id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-brand-foreground">
                          {sale.shopName}
                        </p>
                        <p className="text-brand-muted">
                          {formatSaleTime(sale.createdAt)} · {sale.itemsCount}{' '}
                          artikel{sale.itemsCount === 1 ? '' : 'ar'}
                        </p>
                      </div>
                      <span className="font-semibold text-brand-foreground">
                        {formatCurrency(sale.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <AdminExportPanel
              organizationId={activeOrg._id}
              shopId={selectedShopId === 'all' ? undefined : selectedShopId}
              start={start}
              end={end}
            />

            <details className="relaxed-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-brand-foreground">
                Hjälp: exportformat (Excel &amp; SIE)
              </summary>
              <div className="mt-4 space-y-3 text-sm text-brand-muted">
                <p>
                  Excel-filen har formaterad tabell med kolumnbredd, filter och
                  summa-rad. Kolumner: datum, kiosk, belopp, referens, status,
                  artiklar. Du kan välja att inkludera icke verifierade köp.
                </p>
                <p>
                  SIE4 exporteras med standardkonto 3010 om inget annat anges
                  under Fakturering. Sätt organisationsnummer där för korrekt
                  #ORGNR i filen.
                </p>
                <Link
                  to="/hjalp/export"
                  className="inline-flex cursor-pointer text-brand hover:underline"
                >
                  Läs mer om export
                </Link>
              </div>
            </details>
          </>
        ) : null}

        {shops.length === 0 ? (
          <div className="relaxed-surface rounded-3xl border-dashed p-10 text-center">
            <p className="text-sm text-brand-muted">
              Inga kiosker i den här föreningen ännu.
            </p>
            {isTreasurer ? (
              <Link
                to="/admin/skapa-kiosk"
                search={{ organizationId: activeOrg._id }}
                className="relaxed-primary-button mt-4 inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
              >
                Skapa kiosk
              </Link>
            ) : null}
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            {shopCards.map((shop) => {
              const shopDoc = shops.find((item) => item._id === shop.shopId)
              return (
                <article
                  key={shop.shopId}
                  className="relaxed-surface flex h-full flex-col gap-5 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-foreground">
                        {shop.shopName}
                      </h3>
                      {shop.teamLabel ? (
                        <span className="relaxed-chip mt-2 inline-flex px-2 py-1 text-xs">
                          {shop.teamLabel}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        shop.licenseActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {shop.licenseActive ? 'Öppen' : 'Stängd'}
                    </span>
                  </div>

                  {isTreasurer || editorSummaries ? (
                    <div className="grid gap-3 text-center sm:grid-cols-3">
                      <div className="relaxed-surface-soft bg-surface-muted/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                          {isTreasurer ? 'Period' : '7 dagar'}
                        </p>
                        <p className="text-xl font-semibold text-brand-foreground">
                          {formatCurrency(shop.periodRevenue)}
                        </p>
                      </div>
                      <div className="relaxed-surface-soft bg-surface-muted/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                          Idag
                        </p>
                        <p className="text-xl font-semibold text-brand-foreground">
                          {formatCurrency(shop.todayRevenue)}
                        </p>
                      </div>
                      <div className="relaxed-surface-soft bg-surface-muted/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                          Helgen
                        </p>
                        <p className="text-xl font-semibold text-brand-foreground">
                          {formatCurrency(shop.weekendRevenue)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {shop.latestSaleAt && shop.latestSaleAmount !== null ? (
                    <p className="text-center text-xs text-brand-muted">
                      Senaste köp: {formatCurrency(shop.latestSaleAmount)} ·{' '}
                      {formatSaleTime(shop.latestSaleAt)}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap justify-center gap-2">
                    <Link
                      to="/admin/$shopId"
                      params={{ shopId: shop.shopId }}
                      className="relaxed-primary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-white"
                    >
                      Hantera kiosk
                    </Link>
                    {shop.licenseActive && shopDoc ? (
                      <Link
                        to="/s/$shopSlug"
                        params={{ shopSlug: shopDoc.slug }}
                        className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-5 text-sm font-semibold text-brand-muted"
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

export function AdminOrgDashboardEmpty({ email }: { email: string }) {
  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-brand-foreground">
            Föreningens kiosker
          </h1>
          <p className="text-sm text-brand-muted">
            Inloggad som <span className="font-medium">{email}</span>
          </p>
        </header>
        <div className="relaxed-surface rounded-3xl border-dashed p-10 text-center">
          <p className="text-sm text-brand-muted">
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
