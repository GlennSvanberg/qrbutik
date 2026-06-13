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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function SuperAdminActivity({ summary, events }: SuperAdminActivityProps) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Aktivitet (7 dagar)</h2>
        <p className="mt-1 text-sm text-slate-600">
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
          <h3 className="text-sm font-semibold text-slate-900">Kioskbesök</h3>
          {summary.shopVisits.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Inga besök registrerade.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {summary.shopVisits.map((shop) => (
                <li
                  key={shop.shopSlug}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>
                    {shop.shopName}{' '}
                    <span className="text-slate-400">({shop.shopSlug})</span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {shop.uniqueVisitors} besökare
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relaxed-surface p-5">
          <h3 className="text-sm font-semibold text-slate-900">Sidvisningar</h3>
          {summary.pageViews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Inga sidvisningar registrerade.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {summary.pageViews.map((page) => (
                <li
                  key={page.path}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span className="font-mono text-xs">{page.path}</span>
                  <span className="font-semibold text-slate-900">
                    {page.uniqueVisitors} besökare
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="relaxed-surface overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Senaste händelser</h3>
        </div>
        {events.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Inga händelser ännu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tid</th>
                  <th className="px-5 py-3 font-semibold">Typ</th>
                  <th className="px-5 py-3 font-semibold">Detalj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event.eventId}>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900">
                      {platformEventTypeLabel[event.type] ?? event.type}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {event.detail}
                      {event.actorEmail ? (
                        <span className="mt-0.5 block text-xs text-slate-400">
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
