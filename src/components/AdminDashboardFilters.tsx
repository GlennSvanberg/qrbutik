import {
  
  dashboardPeriodOptions
} from '../lib/adminDashboard'
import type {DashboardPeriod} from '../lib/adminDashboard';
import type { Id } from '../../convex/_generated/dataModel'

type AdminDashboardFiltersProps = {
  period: DashboardPeriod
  onPeriodChange: (period: DashboardPeriod) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
  shopId: Id<'shops'> | 'all'
  shopOptions: Array<{ _id: Id<'shops'>; name: string }>
  onShopChange: (shopId: Id<'shops'> | 'all') => void
}

export function AdminDashboardFilters({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  shopId,
  shopOptions,
  onShopChange,
}: AdminDashboardFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {dashboardPeriodOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPeriodChange(option.id)}
            className={`inline-flex h-11 cursor-pointer items-center rounded-full px-4 text-sm font-semibold transition ${
              period === option.id
                ? 'bg-brand text-white'
                : 'bg-surface-muted text-brand-muted hover:bg-surface-muted'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {period === 'custom' ? (
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm text-brand-muted">
            Från
            <input
              type="date"
              value={customStart}
              onChange={(event) => onCustomStartChange(event.target.value)}
              className="relaxed-input h-11 cursor-pointer px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-brand-muted">
            Till
            <input
              type="date"
              value={customEnd}
              onChange={(event) => onCustomEndChange(event.target.value)}
              className="relaxed-input h-11 cursor-pointer px-3"
            />
          </label>
        </div>
      ) : null}

      {shopOptions.length > 1 ? (
        <label className="flex max-w-md flex-col gap-2 text-sm text-brand-muted">
          Kiosk
          <select
            value={shopId}
            onChange={(event) =>
              onShopChange(
                event.target.value === 'all'
                  ? 'all'
                  : (event.target.value as Id<'shops'>),
              )
            }
            className="relaxed-input h-11 cursor-pointer px-3"
          >
            <option value="all">Alla kiosker</option>
            {shopOptions.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  )
}
