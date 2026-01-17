import { Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const sectionRoutes = {
  sales: '/admin/$shopId',
  history: '/admin/$shopId/historik',
  products: '/admin/$shopId/products',
  settings: '/admin/$shopId/settings',
  skylt: '/admin/$shopId/skylt',
} as const

type AdminSection = keyof typeof sectionRoutes

type AdminHeaderProps = {
  ownerEmail: string
  shopId: Id<'shops'>
  section: AdminSection
  shopName?: string
  subtitle?: string
}

export function AdminHeader({
  ownerEmail,
  shopId,
  section,
  shopName,
  subtitle,
}: AdminHeaderProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { data: shops } = useSuspenseQuery(
    convexQuery(api.shops.listByOwnerEmail, { ownerEmail }),
  )

  return (
    <header className="relative border-b border-slate-200 pb-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/admin"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-transparent px-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50"
        >
          Tillbaka
        </Link>

        <div className="flex flex-1 flex-col text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            QRBUTIK.SE
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-slate-900">
              {shopName ?? 'Admin'}
            </h1>
            {subtitle ? (
              <p className="text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
          aria-expanded={isOpen}
          aria-label="Öppna meny"
        >
          <span className="flex h-4 w-5 flex-col justify-between">
            <span className="h-0.5 w-full rounded-full bg-slate-700" />
            <span className="h-0.5 w-full rounded-full bg-slate-700" />
            <span className="h-0.5 w-full rounded-full bg-slate-700" />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Mina butiker
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {shops.map((shop) => (
              <button
                key={shop._id}
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  void navigate({
                    to: sectionRoutes[section],
                    params: { shopId: shop._id },
                  })
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  shop._id === shopId
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{shop.name}</span>
                {shop._id === shopId ? (
                  <span className="text-xs text-indigo-600">Aktiv</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
