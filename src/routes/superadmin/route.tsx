import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AuthGate } from '../../components/auth/AuthGate'
import {
  SuperAdminGate,
  SuperAdminHeader,
} from '../../components/superadmin/SuperAdminGate'

export const Route = createFileRoute('/superadmin')({
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
  component: SuperAdminLayout,
})

function SuperAdminLayout() {
  return (
    <AuthGate
      title="Logga in till plattformspanelen"
      description="Logga in med din plattformsadministratörs-e-post."
      redirectTo="/superadmin"
    >
      <SuperAdminGate>
        <div className="flex min-h-screen flex-col bg-transparent">
          <SuperAdminHeader />
          <Outlet />
        </div>
      </SuperAdminGate>
    </AuthGate>
  )
}
