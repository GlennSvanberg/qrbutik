import type { Id } from '../../convex/_generated/dataModel'

export function adminOrgDashboardPath(orgId: Id<'organizations'>) {
  return `/admin/org/${orgId}` as const
}

export function parseOrgIdFromAdminPath(pathname: string): Id<'organizations'> | undefined {
  const match = pathname.match(/^\/admin\/org\/([^/]+)/)
  if (!match?.[1]) {
    return undefined
  }
  return match[1] as Id<'organizations'>
}
