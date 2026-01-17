import { Link } from '@tanstack/react-router'
import type { Id } from '../../convex/_generated/dataModel'

const tabs = [
  {
    id: 'sales',
    label: 'Försäljning',
    to: '/admin/$shopId' as const,
  },
  {
    id: 'verify',
    label: 'Verifiera',
    to: '/admin/$shopId/verify' as const,
  },
  {
    id: 'products',
    label: 'Produkter',
    to: '/admin/$shopId/products' as const,
  },
  {
    id: 'qr',
    label: 'QR + Skylt',
    to: '/admin/$shopId/qr' as const,
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
              className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-sm'
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
