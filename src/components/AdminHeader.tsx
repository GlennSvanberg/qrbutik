import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { getActiveShopTab, getShopTabRoute } from '../lib/adminShopNav'
import type { Id } from '../../convex/_generated/dataModel'

type AdminHeaderProps = {
  organizationId: Id<'organizations'>
  shopId: Id<'shops'>
  shopName?: string
  subtitle?: string
}

export function AdminHeader({
  organizationId,
  shopId,
  shopName,
  subtitle,
}: AdminHeaderProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const activeTab = getActiveShopTab(pathname)
  const activeRoute = getShopTabRoute(activeTab)
  const { data: shops } = useSuspenseQuery(
    convexQuery(api.organizations.listOrganizationShops, { organizationId }),
  )

  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-900">
          {shopName ?? 'Admin'}
        </h1>
        {subtitle ? (
          <p className="text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>

      {shops.length > 1 ? (
        <label className="flex w-full max-w-xs flex-col gap-2 text-left text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Byt kiosk
          </span>
          <select
            value={shopId}
            onChange={(event) => {
              void navigate({
                to: activeRoute,
                params: { shopId: event.target.value as Id<'shops'> },
              })
            }}
            className="relaxed-input h-12 w-full cursor-pointer px-4 text-base text-slate-900 outline-none"
          >
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </header>
  )
}
