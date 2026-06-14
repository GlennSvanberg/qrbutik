import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { SuperAdminActivity } from './SuperAdminActivity'
import { SuperAdminKioskTable } from './SuperAdminKioskTable'
import { SuperAdminOrgTable } from './SuperAdminOrgTable'
import { SuperAdminOverview } from './SuperAdminOverview'

export function SuperAdminDashboard() {
  const now = useMemo(() => Date.now(), [])
  const [highlightedOrganizationId, setHighlightedOrganizationId] = useState<
    string | null
  >(null)

  const { data: overview, isPending: overviewPending } = useQuery(
    convexQuery(api.superadmin.getPlatformOverview, { now }),
  )

  const { data: organizations, isPending: orgsPending } = useQuery(
    convexQuery(api.superadmin.listOrganizations, {}),
  )

  const { data: shops, isPending: shopsPending } = useQuery(
    convexQuery(api.superadmin.listAllShops, { now }),
  )

  const { data: activitySummary, isPending: activitySummaryPending } = useQuery(
    convexQuery(api.superadmin.getActivitySummary, { now }),
  )

  const { data: recentEvents, isPending: recentEventsPending } = useQuery(
    convexQuery(api.superadmin.listRecentPlatformEvents, { limit: 50 }),
  )

  const isPending =
    overviewPending ||
    orgsPending ||
    shopsPending ||
    activitySummaryPending ||
    recentEventsPending

  const handleSelectOrganization = (organizationId: string) => {
    setHighlightedOrganizationId(organizationId)
    const element = document.getElementById(`org-${organizationId}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (
    isPending ||
    !overview ||
    !organizations ||
    !shops ||
    !activitySummary ||
    !recentEvents
  ) {
    return (
      <main className="relaxed-page-shell flex-1 px-6 py-10">
        <div className="relaxed-surface mx-auto max-w-7xl p-8 text-center">
          <p className="text-sm text-brand-muted">Laddar plattformsdata...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relaxed-page-shell flex-1 px-6 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <SuperAdminOverview
          overview={overview}
          onSelectOrganization={handleSelectOrganization}
        />
        <SuperAdminActivity summary={activitySummary} events={recentEvents} />
        <SuperAdminOrgTable
          organizations={organizations}
          highlightedOrganizationId={highlightedOrganizationId}
        />
        <SuperAdminKioskTable shops={shops} />
      </div>
    </main>
  )
}
