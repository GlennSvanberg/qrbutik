import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { AdminHeader } from './AdminHeader'
import { AdminShopNav } from './AdminShopNav'
import type { ReactNode } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

type AdminShopShellProps = {
  shopId: Id<'shops'>
  children: ReactNode
}

export function AdminShopShell({ shopId, children }: AdminShopShellProps) {
  const { data: shop } = useSuspenseQuery(
    convexQuery(api.shops.getShopById, { shopId }),
  )

  if (!shop) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-3 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Kiosken hittades inte
          </h1>
          <Link
            to="/admin"
            className="relaxed-primary-button mx-auto w-fit cursor-pointer px-5 py-3 text-sm font-semibold text-white"
          >
            Till adminpanelen
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relaxed-page-shell min-h-screen bg-transparent print:bg-white print:px-0 print:pb-0 print:pt-0">
      <div className="print:hidden">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 pt-6">
          <AdminHeader
            organizationId={shop.organizationId}
            shopId={shop._id}
            shopName={shop.name}
          />
          <AdminShopNav shopId={shop._id} organizationId={shop.organizationId} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6 pb-10 print:max-w-none print:p-0">
        {children}
      </div>
    </main>
  )
}
