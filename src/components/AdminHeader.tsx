import { Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useEffect, useRef, useState } from 'react'
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
  const containerRef = useRef<HTMLElement | null>(null)
  const { data: shops } = useSuspenseQuery(
    convexQuery(api.shops.listByOwnerEmail, { ownerEmail }),
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current
      if (!container) {
        return
      }
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (!container.contains(target)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen])

  return (
    <header
      ref={containerRef}
      className="relative border-b pb-4 relaxed-divider"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/admin"
          className="relaxed-secondary-button inline-flex h-12 items-center justify-center px-3 text-xs font-semibold text-stone-700"
          trackaton-on-click="admin-back"
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
          className="relaxed-secondary-button flex h-12 w-12 items-center justify-center text-slate-700"
          aria-expanded={isOpen}
          aria-controls="admin-header-menu"
          trackaton-on-click="admin-menu-toggle"
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
        <div
          id="admin-header-menu"
          role="menu"
          aria-label="Välj butik"
          className="relaxed-surface absolute left-0 right-0 top-full z-20 mt-3 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Mina butiker
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {shops.map((shop) => (
              <button
                key={shop._id}
                type="button"
                role="menuitem"
                trackaton-on-click="admin-switch-shop"
                onClick={() => {
                  setIsOpen(false)
                  void navigate({
                    to: sectionRoutes[section],
                    params: { shopId: shop._id },
                  })
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  shop._id === shopId
                    ? 'border-stone-200 bg-stone-50/80 text-stone-700'
                    : 'border-stone-200/80 bg-stone-50/80 text-slate-700 hover:border-stone-300 hover:bg-stone-100/60'
                }`}
              >
                <span>{shop.name}</span>
                {shop._id === shopId ? (
                  <span className="text-xs text-stone-600">Aktiv</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
