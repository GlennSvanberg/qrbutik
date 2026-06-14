import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMrr,
  subscriptionBadgeClass,
  subscriptionLabel,
} from '../../lib/superadminUi'

type OverviewData = {
  totalOrganizations: number
  totalShops: number
  totalMembers: number
  statusCounts: {
    trialing: number
    active: number
    past_due: number
    canceled: number
    inactive: number
  }
  estimatedMrrKr: number
  trialsExpiringSoon: Array<{
    organizationId: string
    name: string
    subscriptionStatus: string
    trialEndsAt: number | null
  }>
  needsAttention: Array<{
    organizationId: string
    name: string
    subscriptionStatus: string
    trialEndsAt: number | null
  }>
  recentOrganizations: Array<{
    organizationId: string
    name: string
    subscriptionStatus: string
    createdAt: number
  }>
  platformTransactionStats: {
    verifiedCount7d: number
    verifiedRevenue7d: number
  }
}

type SuperAdminOverviewProps = {
  overview: OverviewData
  onSelectOrganization?: (organizationId: string) => void
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        subscriptionBadgeClass[status] ?? subscriptionBadgeClass.inactive
      }`}
    >
      {subscriptionLabel[status] ?? status}
    </span>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="relaxed-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-brand-foreground">{value}</p>
    </div>
  )
}

function AlertList({
  title,
  items,
  emptyText,
  onSelectOrganization,
}: {
  title: string
  items: OverviewData['needsAttention']
  emptyText: string
  onSelectOrganization?: (organizationId: string) => void
}) {
  return (
    <div className="relaxed-surface p-5">
      <h3 className="text-sm font-semibold text-brand-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-brand-muted">{emptyText}</p>
      ) : (
        <ul className="mt-3 divide-y divide-brand-border">
          {items.map((item) => (
            <li key={item.organizationId} className="flex items-center justify-between gap-3 py-3">
              <div>
                {onSelectOrganization ? (
                  <button
                    type="button"
                    onClick={() => onSelectOrganization(item.organizationId)}
                    className="cursor-pointer text-left text-sm font-semibold text-brand underline decoration-brand/30 underline-offset-4"
                  >
                    {item.name}
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-brand-foreground">{item.name}</p>
                )}
                {item.trialEndsAt !== null ? (
                  <p className="text-xs text-brand-muted">
                    Trial till {formatDateTime(item.trialEndsAt)}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={item.subscriptionStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SuperAdminOverview({
  overview,
  onSelectOrganization,
}: SuperAdminOverviewProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Föreningar" value={String(overview.totalOrganizations)} />
        <KpiCard label="Betalande" value={String(overview.statusCounts.active)} />
        <KpiCard label="Provperiod" value={String(overview.statusCounts.trialing)} />
        <KpiCard label="Förfallna" value={String(overview.statusCounts.past_due)} />
        <KpiCard label="Kiosker" value={String(overview.totalShops)} />
        <KpiCard label="Uppskattad MRR" value={formatMrr(overview.estimatedMrrKr)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relaxed-surface p-5">
          <h3 className="text-sm font-semibold text-brand-foreground">Plattformsförsäljning (7 dagar)</h3>
          <p className="mt-3 text-2xl font-semibold text-brand-foreground">
            {formatCurrency(overview.platformTransactionStats.verifiedRevenue7d)}
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            {overview.platformTransactionStats.verifiedCount7d} verifierade köp ·{' '}
            {overview.totalMembers} medlemmar totalt
          </p>
        </div>

        <div className="relaxed-surface p-5">
          <h3 className="text-sm font-semibold text-brand-foreground">Senaste registreringar</h3>
          {overview.recentOrganizations.length === 0 ? (
            <p className="mt-3 text-sm text-brand-muted">Inga föreningar ännu.</p>
          ) : (
            <ul className="mt-3 divide-y divide-brand-border">
              {overview.recentOrganizations.map((org) => (
                <li
                  key={org.organizationId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    {onSelectOrganization ? (
                      <button
                        type="button"
                        onClick={() => onSelectOrganization(org.organizationId)}
                        className="cursor-pointer text-left text-sm font-semibold text-brand underline decoration-brand/30 underline-offset-4"
                      >
                        {org.name}
                      </button>
                    ) : (
                      <p className="text-sm font-semibold text-brand-foreground">{org.name}</p>
                    )}
                    <p className="text-xs text-brand-muted">{formatDate(org.createdAt)}</p>
                  </div>
                  <StatusBadge status={org.subscriptionStatus} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AlertList
          title="Trial löper ut inom 7 dagar"
          items={overview.trialsExpiringSoon}
          emptyText="Inga provperioder löper ut snart."
          onSelectOrganization={onSelectOrganization}
        />
        <AlertList
          title="Kräver uppmärksamhet"
          items={overview.needsAttention}
          emptyText="Inga förfallna eller inaktiva föreningar just nu."
          onSelectOrganization={onSelectOrganization}
        />
      </div>
    </section>
  )
}

export { StatusBadge }
