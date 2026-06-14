import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { getActiveShopTab, getVisibleShopTabs } from '../lib/adminShopNav'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type AdminShopNavProps = {
  shopId: Id<'shops'>
  organizationId: Id<'organizations'>
}

export function AdminShopNav({ shopId, organizationId }: AdminShopNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const activeTab = getActiveShopTab(pathname)
  const { data: organizations } = useQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )

  const role =
    organizations?.find((org) => org._id === organizationId)?.role ?? 'editor'
  const tabs = getVisibleShopTabs(role)

  return (
    <nav
      aria-label="Kioskmeny"
      className="-mx-6 border-b border-brand-border/80 px-6"
    >
      <div className="flex overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <Link
              key={tab.id}
              to={tab.to}
              params={{ shopId }}
              className={`inline-flex h-12 shrink-0 cursor-pointer items-center border-b-2 px-4 text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-brand-muted hover:border-brand-border hover:text-brand-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
