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
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Föreningar</h2>
        <p className="text-sm text-slate-600">
          Alla kunder, licensstatus och plattformsåtgärder.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
          <tbody className="divide-y divide-slate-100">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-600">
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
                    <p className="font-semibold text-slate-900">{org.name}</p>
                    <p className="text-xs text-slate-500">{org.billingEmail}</p>
                    {org.ownerEmail ? (
                      <p className="text-xs text-slate-500">Owner: {org.ownerEmail}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge status={org.subscriptionStatus} />
                  </td>
                  <td className="px-5 py-4 align-top text-slate-700">
                    {org.trialEndsAt !== null
                      ? formatDateTime(org.trialEndsAt)
                      : '—'}
                  </td>
                  <td className="px-5 py-4 align-top text-slate-700">{org.shopCount}</td>
                  <td className="px-5 py-4 align-top text-slate-700">{org.memberCount}</td>
                  <td className="px-5 py-4 align-top text-slate-700">
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
                      <span className="text-slate-400">—</span>
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
