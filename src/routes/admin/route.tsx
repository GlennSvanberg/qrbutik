import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '../../components/auth/AuthGate'

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  headers: () => ({
    'X-Robots-Tag': 'noindex, nofollow',
  }),
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <AuthGate
      title="Logga in till adminpanelen"
      description="Logga in med e-post för att hantera föreningens kiosker."
    >
      <Outlet />
    </AuthGate>
  )
}
