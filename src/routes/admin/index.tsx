import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { authClient } from '../../lib/authClient'
import { AdminOrgDashboardEmpty } from '../../components/AdminOrgDashboard'
import type { Id } from '../../../convex/_generated/dataModel'

type AdminIndexSearch = {
  organizationId?: string
}

export const Route = createFileRoute('/admin/')({
  validateSearch: (search: Record<string, unknown>): AdminIndexSearch => ({
    organizationId:
      typeof search.organizationId === 'string'
        ? search.organizationId
        : undefined,
  }),
  component: AdminIndexRedirect,
})

function AdminIndexRedirect() {
  const { organizationId: organizationIdFromSearch } = Route.useSearch()
  const { data: session } = authClient.useSession()
  const email = session?.user.email ?? ''
  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizations.getMyOrganizations, {}),
  )

  if (organizations.length === 0) {
    return <AdminOrgDashboardEmpty email={email} />
  }

  const targetOrgId =
    organizationIdFromSearch &&
    organizations.some((org) => org._id === organizationIdFromSearch)
      ? (organizationIdFromSearch as Id<'organizations'>)
      : organizations[0]._id

  return (
    <Navigate
      to="/admin/org/$orgId"
      params={{ orgId: targetOrgId }}
      replace
    />
  )
}
