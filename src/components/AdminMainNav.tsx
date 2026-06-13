import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { SignOutButton } from './auth/ShopAccessGate'
import type { Id } from '../../convex/_generated/dataModel'

type NavLinkItem = {
  id: string
  label: string
  to: '/admin' | '/admin/skapa-kiosk' | '/admin/billing' | '/skapa'
  search?: { organizationId: Id<'organizations'> }
}

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname })
}

function isNavItemActive(pathname: string, item: NavLinkItem) {
  if (item.to === '/admin') {
    return pathname === '/admin' || pathname === '/admin/'
  }
  return pathname.startsWith(item.to)
}

function NavLink({
  item,
  pathname,
  onNavigate,
  className,
}: {
  item: NavLinkItem
  pathname: string
  onNavigate?: () => void
  className?: string
}) {
  const isActive = isNavItemActive(pathname, item)

  return (
    <Link
      to={item.to}
      search={item.search}
      onClick={onNavigate}
      className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-4 text-sm font-semibold transition ${
        isActive
          ? 'bg-brand/10 text-brand'
          : 'text-slate-600 hover:bg-stone-100/80 hover:text-slate-900'
      } ${className ?? ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Link>
  )
}

export function AdminMainNav() {
  const pathname = useActivePath()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  const { data: organizations } = useQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )

  const orgList = organizations ?? []
  const hasOrganizations = orgList.length > 0

  const organizationIdFromSearch = useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>
      return typeof search.organizationId === 'string'
        ? (search.organizationId as Id<'organizations'>)
        : undefined
    },
  })

  const activeOrg = useMemo(() => {
    if (orgList.length === 0) {
      return null
    }
    if (
      organizationIdFromSearch &&
      orgList.some((org) => org._id === organizationIdFromSearch)
    ) {
      return orgList.find((org) => org._id === organizationIdFromSearch) ?? orgList[0]
    }
    return orgList[0]
  }, [orgList, organizationIdFromSearch])

  const canManageBilling =
    activeOrg?.role === 'owner' || activeOrg?.role === 'treasurer'

  const navLinks = useMemo((): Array<NavLinkItem> => {
    if (!hasOrganizations || !activeOrg) {
      return [{ id: 'create-org', label: 'Skapa förening', to: '/skapa' }]
    }

    const orgSearch = { organizationId: activeOrg._id }
    const links: Array<NavLinkItem> = [
      { id: 'kiosks', label: 'Kiosker', to: '/admin' },
      {
        id: 'create-kiosk',
        label: 'Skapa kiosk',
        to: '/admin/skapa-kiosk',
        search: orgSearch,
      },
    ]

    if (canManageBilling) {
      links.push({
        id: 'billing',
        label: 'Fakturering',
        to: '/admin/billing',
        search: orgSearch,
      })
    }

    return links
  }, [activeOrg, canManageBilling, hasOrganizations])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
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
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isMobileMenuOpen])

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur print:hidden"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          to="/admin"
          className="flex min-h-11 cursor-pointer flex-col justify-center"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            QRButik.se
          </span>
          {activeOrg ? (
            <span className="text-sm font-semibold text-slate-900">
              {activeOrg.name}
            </span>
          ) : (
            <span className="text-sm font-semibold text-slate-900">Admin</span>
          )}
        </Link>

        <nav
          aria-label="Huvudmeny"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((item) => (
            <NavLink key={item.id} item={item} pathname={pathname} />
          ))}
          <SignOutButton />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="relaxed-secondary-button flex h-11 w-11 cursor-pointer items-center justify-center text-slate-700"
            aria-expanded={isMobileMenuOpen}
            aria-controls="admin-main-nav-menu"
            aria-label={isMobileMenuOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            <span className="flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full rounded-full bg-slate-700 transition ${
                  isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-slate-700 transition ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-slate-700 transition ${
                  isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <nav
          id="admin-main-nav-menu"
          aria-label="Huvudmeny mobil"
          className="border-t border-stone-200/80 bg-white px-6 py-4 md:hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                pathname={pathname}
                onNavigate={() => setIsMobileMenuOpen(false)}
                className="w-full justify-start"
              />
            ))}
            <div className="pt-2">
              <SignOutButton />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
