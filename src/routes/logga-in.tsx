import { createFileRoute } from '@tanstack/react-router'
import { AuthRedirectGate } from '../components/auth/AuthGate'
import { LoginForm } from '../components/auth/LoginForm'

type LoggaInSearch = {
  redirect?: string
  invite?: string
}

export const Route = createFileRoute('/logga-in')({
  validateSearch: (search: Record<string, unknown>): LoggaInSearch => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : '/admin',
    invite: typeof search.invite === 'string' ? search.invite : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: 'Logga in – QRButik',
      },
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  component: LoggaInPage,
})

function LoggaInPage() {
  const { redirect = '/admin', invite } = Route.useSearch()
  const redirectTo = invite
    ? `${redirect}${redirect.includes('?') ? '&' : '?'}invite=${encodeURIComponent(invite)}`
    : redirect

  return (
    <AuthRedirectGate to={redirectTo}>
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <LoginForm
          redirectTo={redirectTo}
          title="Logga in till QRButik"
          description="För styrelse, kassör och lagledare. Vi skickar en säker länk till din e-post — inget lösenord."
        />
      </main>
    </AuthRedirectGate>
  )
}
