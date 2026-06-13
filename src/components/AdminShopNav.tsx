import { Link, useRouterState } from '@tanstack/react-router'
import { adminShopTabs, getActiveShopTab } from '../lib/adminShopNav'
import type { Id } from '../../convex/_generated/dataModel'

type AdminShopNavProps = {
  shopId: Id<'shops'>
}

export function AdminShopNav({ shopId }: AdminShopNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const activeTab = getActiveShopTab(pathname)

  return (
    <nav
      aria-label="Kioskmeny"
      className="-mx-6 border-b border-stone-200/80 px-6"
    >
      <div className="flex overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {adminShopTabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <Link
              key={tab.id}
              to={tab.to}
              params={{ shopId }}
              trackaton-on-click={`admin-tab-${tab.id}`}
              className={`inline-flex h-12 shrink-0 cursor-pointer items-center border-b-2 px-4 text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-600 hover:border-stone-300 hover:text-slate-900'
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
