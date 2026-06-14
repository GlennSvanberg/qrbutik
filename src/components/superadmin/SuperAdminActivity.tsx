import {
  formatCurrency,
  formatDateTime,
  platformEventTypeLabel,
} from '../../lib/superadminUi'

type ActivitySummary = {
  orgsCreated: number
  shopsCreated: number
  checkoutCount: number
  checkoutRevenueKr: number
  shopVisits: Array<{
    shopSlug: string
    shopName: string
    uniqueVisitors: number
  }>
  pageViews: Array<{
    path: string
    uniqueVisitors: number
  }>
}

type ActivityEvent = {
  eventId: string
  type: string
  createdAt: number
  detail: string
  actorEmail: string | null
}

type SuperAdminActivityProps = {
  summary: ActivitySummary
  events: Array<ActivityEvent>
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

export function SuperAdminActivity({ summary, events }: SuperAdminActivityProps) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-brand-foreground">Aktivitet (7 dagar)</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Besök, köp och registreringar på plattformen.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Nya föreningar" value={String(summary.orgsCreated)} />
        <KpiCard label="Nya kiosker" value={String(summary.shopsCreated)} />
        <KpiCard
          label="Köp påbörjade"
          value={String(summary.checkoutCount)}
        />
        <KpiCard
          label="Köpsumma"
          value={formatCurrency(summary.checkoutRevenueKr)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relaxed-surface p-5">
          <h3 className="text-sm font-semibold text-brand-foreground">Kioskbesök</h3>
          {summary.shopVisits.length === 0 ? (
            <p className="mt-3 text-sm text-brand-muted">Inga besök registrerade.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {summary.shopVisits.map((shop) => (
                <li
                  key={shop.shopSlug}
                  className="flex items-center justify-between text-sm text-brand-muted"
                >
                  <span>
                    {shop.shopName}{' '}
                    <span className="text-subtle">({shop.shopSlug})</span>
                  </span>
                  <span className="font-semibold text-brand-foreground">
                    {shop.uniqueVisitors} besökare
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relaxed-surface p-5">
          <h3 className="text-sm font-semibold text-brand-foreground">Sidvisningar</h3>
          {summary.pageViews.length === 0 ? (
            <p className="mt-3 text-sm text-brand-muted">Inga sidvisningar registrerade.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {summary.pageViews.map((page) => (
                <li
                  key={page.path}
                  className="flex items-center justify-between text-sm text-brand-muted"
                >
                  <span className="font-mono text-xs">{page.path}</span>
                  <span className="font-semibold text-brand-foreground">
                    {page.uniqueVisitors} besökare
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="relaxed-surface overflow-hidden">
        <div className="border-b border-brand-border px-5 py-4">
          <h3 className="text-sm font-semibold text-brand-foreground">Senaste händelser</h3>
        </div>
        {events.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-brand-muted">
            Inga händelser ännu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tid</th>
                  <th className="px-5 py-3 font-semibold">Typ</th>
                  <th className="px-5 py-3 font-semibold">Detalj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {events.map((event) => (
                  <tr key={event.eventId}>
                    <td className="whitespace-nowrap px-5 py-3 text-brand-muted">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-brand-foreground">
                      {platformEventTypeLabel[event.type] ?? event.type}
                    </td>
                    <td className="px-5 py-3 text-brand-muted">
                      {event.detail}
                      {event.actorEmail ? (
                        <span className="mt-0.5 block text-xs text-subtle">
                          {event.actorEmail}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
