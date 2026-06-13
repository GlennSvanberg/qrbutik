import { createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
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
  const { shopId } = Route.useParams()
  const shopIdParam = shopId as Id<'shops'>
  const [period, setPeriod] = useState<Period>('today')
  const { data: summary } = useQuery({
    ...convexQuery(api.transactions.getPeriodSummary, {
      shopId: shopIdParam,
      period,
    }),
    placeholderData: keepPreviousData,
  })

  if (!summary) {
    return (
      <div className="relaxed-surface p-8 text-center">
        <p className="text-sm text-slate-600">Laddar försäljning...</p>
      </div>
    )
  }

  const formattedTotal = Math.round(summary.totalRevenue).toLocaleString('sv-SE')
  const formattedAverage = Math.round(summary.averageOrderValue).toLocaleString(
    'sv-SE',
  )
  const formattedLastSale = summary.lastSaleTime
    ? new Date(summary.lastSaleTime).toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

  return (
    <>
      <section className="relaxed-divider flex flex-col gap-5 border-b pb-6">
          <div className="flex items-center justify-center">
            <div className="relaxed-surface-soft grid w-full max-w-2xl grid-cols-5 gap-2 rounded-full p-1">
              {periodOptions.map((option) => {
                const isActive = period === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriod(option.value)}
                    className={`min-h-[2.5rem] w-full cursor-pointer whitespace-nowrap rounded-full px-3 text-xs font-semibold transition ${
                      isActive
                        ? 'relaxed-primary-button text-white'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relaxed-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Totalt
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formattedTotal} kr
              </p>
            </div>
            <div className="relaxed-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Betalningar
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {summary.transactionCount}
              </p>
            </div>
            <div className="relaxed-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Snittköp
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formattedAverage} kr
              </p>
            </div>
            <div className="relaxed-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Senaste köp
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formattedLastSale}
              </p>
            </div>
          </div>
        </section>

        <section className="relaxed-divider flex flex-col gap-4 border-b pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Topplista</h2>
            <span className="text-xs text-slate-500">Topp 5</span>
          </div>
          <div className="relaxed-surface divide-y divide-slate-200/70 px-4">
            {summary.topItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Ingen försäljning ännu.
              </div>
            ) : (
              summary.topItems.map((item) => (
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
          <div className="relaxed-surface divide-y divide-slate-200/70 px-4">
            {summary.recentSales.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Inga köp ännu.
              </div>
            ) : (
              summary.recentSales.map((sale) => (
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
    </>
  )
}
