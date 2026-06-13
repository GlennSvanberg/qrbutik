import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AdminMainNav } from '../../components/AdminMainNav'
import { AdminMemberSync } from '../../components/AdminMemberSync'
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
      <div className="flex min-h-screen flex-col">
        <AdminMemberSync />
        <AdminMainNav />
        <Outlet />
      </div>
    </AuthGate>
  )
}
