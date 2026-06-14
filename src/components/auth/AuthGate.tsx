import { Navigate, useRouterState } from '@tanstack/react-router'
import { authClient } from '../../lib/authClient'
import { LoginForm } from './LoginForm'
import type { ReactNode } from 'react'

type AuthGateProps = {
  children: ReactNode
  redirectTo?: string
  title?: string
  description?: string
}

export function AuthGate({
  children,
  redirectTo,
  title,
  description,
}: AuthGateProps) {
  const { data: session, isPending } = authClient.useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const loginRedirect = redirectTo ?? pathname

  if (isPending) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <div className="relaxed-surface mx-auto flex w-full max-w-xl flex-col gap-3 p-8 text-center">
          <h1 className="text-2xl font-semibold text-brand-foreground">Laddar...</h1>
          <p className="text-sm text-brand-muted">Kontrollerar din session.</p>
        </div>
      </main>
    )
  }

  if (!session?.user.email) {
    return (
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <LoginForm
          redirectTo={loginRedirect}
          title={title}
          description={description}
          showCreateLink={false}
        />
      </main>
    )
  }

  return <>{children}</>
}

export function AuthRedirectGate({
  children,
  to = '/admin',
}: {
  children: ReactNode
  to?: string
}) {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return null
  }

  if (session?.user.email) {
    return <Navigate to={to} replace />
  }

  return <>{children}</>
}
