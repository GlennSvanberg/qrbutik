import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminDashboard } from '../../components/superadmin/SuperAdminDashboard'

export const Route = createFileRoute('/superadmin/')({
  head: () => ({
    meta: [
      {
        title: 'Platform Control Tower – QRButik',
      },
    ],
  }),
  component: SuperAdminPage,
})

function SuperAdminPage() {
  return <SuperAdminDashboard />
}
