import { Link } from '@tanstack/react-router'
import type { Id } from '../../convex/_generated/dataModel'

const tabs = [
  {
    id: 'sales',
    label: 'Försäljning',
    to: '/admin/$shopId' as const,
  },
  {
    id: 'history',
    label: 'Köphistorik',
    to: '/admin/$shopId/historik' as const,
  },
  {
    id: 'products',
    label: 'Produkter',
    to: '/admin/$shopId/products' as const,
  },
  {
    id: 'skylt',
    label: 'Skylt',
    to: '/admin/$shopId/skylt' as const,
  },
  {
    id: 'settings',
    label: 'Inställningar',
    to: '/admin/$shopId/settings' as const,
  },
] as const

type AdminTab = (typeof tabs)[number]['id']

type AdminBottomNavProps = {
  shopId: Id<'shops'>
  active: AdminTab
}

export function AdminBottomNav({ shopId, active }: AdminBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-slate-50/95 px-4 pb-5 pt-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <Link
              key={tab.id}
              to={tab.to}
              params={{ shopId }}
              trackaton-on-click={`admin-tab-${tab.id}`}
              className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg px-2 py-3 text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
