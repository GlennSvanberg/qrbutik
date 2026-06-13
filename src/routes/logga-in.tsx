import { createFileRoute } from '@tanstack/react-router'
import { AuthRedirectGate } from '../components/auth/AuthGate'
import { LoginForm } from '../components/auth/LoginForm'

type LoggaInSearch = {
  redirect?: string
}

export const Route = createFileRoute('/logga-in')({
  validateSearch: (search: Record<string, unknown>): LoggaInSearch => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : '/admin',
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
  const { redirect = '/admin' } = Route.useSearch()

  return (
    <AuthRedirectGate to={redirect}>
      <main className="relaxed-page-shell min-h-screen px-6 py-12">
        <LoginForm
          redirectTo={redirect}
          title="Logga in till QRButik"
          description="För styrelse, kassör och lagledare. Vi skickar en säker länk till din e-post — inget lösenord."
        />
      </main>
    </AuthRedirectGate>
  )
}
