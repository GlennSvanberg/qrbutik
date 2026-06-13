import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { authClient } from '../../lib/authClient'
import { stripeDashboardHomeUrl } from '../../lib/superadminUi'
import type { ReactNode } from 'react'

type SuperAdminGateProps = {
  children: ReactNode
}

function SuperAdminNotFound() {
  return (
    <main className="relaxed-page-shell min-h-screen px-6 py-12">
      <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-3 p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Sidan hittades inte</h1>
        <p className="text-sm text-slate-600">
          Kontrollera adressen eller gå tillbaka till startsidan.
        </p>
        <a
          href="/"
          className="mt-2 text-sm font-semibold text-brand underline decoration-brand/30 underline-offset-4"
        >
          Till startsidan
        </a>
      </div>
    </main>
  )
}

export function SuperAdminGate({ children }: SuperAdminGateProps) {
  const { data: canAccess, isPending } = useQuery(
    convexQuery(api.superadmin.canAccess, {}),
  )

  if (isPending) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-3 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Laddar...</h1>
          <p className="text-sm text-slate-600">Kontrollerar behörighet.</p>
        </div>
      </main>
    )
  }

  if (!canAccess) {
    return <SuperAdminNotFound />
  }

  return <>{children}</>
}

export function SuperAdminHeader() {
  const { data: session } = authClient.useSession()
  const email = session?.user.email ?? ''

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Platform
          </p>
          <h1 className="text-xl font-semibold text-slate-900">QRButik Control Tower</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span>
            Inloggad som <span className="font-medium text-slate-900">{email}</span>
          </span>
          <a
            href={stripeDashboardHomeUrl()}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer font-semibold text-brand underline decoration-brand/30 underline-offset-4"
          >
            Stripe Dashboard
          </a>
        </div>
      </div>
    </header>
  )
}
