import {
  formatDateTime,
  stripeCustomerDashboardUrl,
} from '../../lib/superadminUi'
import { SuperAdminActions } from './SuperAdminActions'
import { StatusBadge } from './SuperAdminOverview'
import type { Id } from '../../../convex/_generated/dataModel'

export type OrganizationRow = {
  organizationId: Id<'organizations'>
  name: string
  billingEmail: string
  subscriptionStatus: string
  trialEndsAt: number | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  createdAt: number
  shopCount: number
  memberCount: number
  ownerEmail: string | null
  lastVerifiedSaleAt: number | null
  licenseActive: boolean
}

type SuperAdminOrgTableProps = {
  organizations: Array<OrganizationRow>
  highlightedOrganizationId?: string | null
}

export function SuperAdminOrgTable({
  organizations,
  highlightedOrganizationId,
}: SuperAdminOrgTableProps) {
  return (
    <section className="relaxed-surface overflow-hidden">
      <div className="border-b border-brand-border px-5 py-4">
        <h2 className="text-lg font-semibold text-brand-foreground">Föreningar</h2>
        <p className="text-sm text-brand-muted">
          Alla kunder, licensstatus och plattformsåtgärder.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Förening</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Trial slut</th>
              <th className="px-5 py-3 font-semibold">Kiosker</th>
              <th className="px-5 py-3 font-semibold">Medlemmar</th>
              <th className="px-5 py-3 font-semibold">Senaste försäljning</th>
              <th className="px-5 py-3 font-semibold">Stripe</th>
              <th className="px-5 py-3 font-semibold">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-brand-muted">
                  Inga föreningar registrerade ännu.
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr
                  key={org.organizationId}
                  id={`org-${org.organizationId}`}
                  className={
                    highlightedOrganizationId === org.organizationId
                      ? 'bg-blue-50/60'
                      : undefined
                  }
                >
                  <td className="px-5 py-4 align-top">
                    <p className="font-semibold text-brand-foreground">{org.name}</p>
                    <p className="text-xs text-brand-muted">{org.billingEmail}</p>
                    {org.ownerEmail ? (
                      <p className="text-xs text-brand-muted">Owner: {org.ownerEmail}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge status={org.subscriptionStatus} />
                  </td>
                  <td className="px-5 py-4 align-top text-brand-muted">
                    {org.trialEndsAt !== null
                      ? formatDateTime(org.trialEndsAt)
                      : '—'}
                  </td>
                  <td className="px-5 py-4 align-top text-brand-muted">{org.shopCount}</td>
                  <td className="px-5 py-4 align-top text-brand-muted">{org.memberCount}</td>
                  <td className="px-5 py-4 align-top text-brand-muted">
                    {org.lastVerifiedSaleAt !== null
                      ? formatDateTime(org.lastVerifiedSaleAt)
                      : '—'}
                  </td>
                  <td className="px-5 py-4 align-top">
                    {org.stripeCustomerId ? (
                      <a
                        href={stripeCustomerDashboardUrl(org.stripeCustomerId)}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer font-semibold text-brand underline decoration-brand/30 underline-offset-4"
                      >
                        Kund
                      </a>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <SuperAdminActions
                      organizationId={org.organizationId}
                      organizationName={org.name}
                      subscriptionStatus={org.subscriptionStatus}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
