import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { authClient } from '../../lib/authClient'
import type { ReactNode } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'

type ShopAccessGateProps = {
  shopId: Id<'shops'>
  children: ReactNode
}

export function ShopAccessGate({ shopId, children }: ShopAccessGateProps) {
  const { data, isPending } = useQuery(
    convexQuery(api.organizations.canAccessShop, { shopId }),
  )

  if (isPending) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-3 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Laddar adminpanelen...
          </h1>
        </div>
      </main>
    )
  }

  if (!data?.canAccess || !data.shop) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-3 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Du har inte behörighet
          </h1>
          <p className="text-sm text-slate-600">
            Den här kiosken tillhör en förening du inte har åtkomst till.
          </p>
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

  return <>{children}</>
}

export function SignOutButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut()
        void navigate({ to: '/logga-in' })
      }}
      className="relaxed-secondary-button inline-flex h-12 cursor-pointer items-center justify-center px-4 text-sm font-semibold text-slate-700"
    >
      Logga ut
    </button>
  )
}
