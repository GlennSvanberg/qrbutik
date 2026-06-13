import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../../convex/_generated/api'
import { authClient } from '../../../../lib/authClient'
import {
  AdminOrgDashboard,
  AdminOrgDashboardEmpty,
} from '../../../../components/AdminOrgDashboard'
import type { Id } from '../../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/org/$orgId/')({
  component: AdminOrgDashboardPage,
})

function AdminOrgDashboardPage() {
  const { orgId } = Route.useParams()
  const { data: session } = authClient.useSession()
  const email = session?.user.email ?? ''
  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )

  if (organizations.length === 0) {
    return <AdminOrgDashboardEmpty email={email} />
  }

  const orgIdParam = orgId as Id<'organizations'>
  const hasAccess = organizations.some((org) => org._id === orgIdParam)

  if (!hasAccess) {
    return (
      <Navigate
        to="/admin/org/$orgId"
        params={{ orgId: organizations[0]._id }}
        replace
      />
    )
  }

  return (
    <AdminOrgDashboard
      email={email}
      organizationId={orgIdParam}
      organizations={organizations}
    />
  )
}
