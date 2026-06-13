import { Link } from '@tanstack/react-router'
import { formatDateTime } from '../../lib/superadminUi'
import type { Id } from '../../../convex/_generated/dataModel'

export type ShopRow = {
  shopId: Id<'shops'>
  organizationId: Id<'organizations'>
  organizationName: string
  shopName: string
  teamLabel: string | null
  slug: string
  swishNumber: string
  licenseActive: boolean
  verifiedTransactionCount7d: number
  lastVerifiedSaleAt: number | null
}

type SuperAdminKioskTableProps = {
  shops: Array<ShopRow>
}

export function SuperAdminKioskTable({ shops }: SuperAdminKioskTableProps) {
  return (
    <section className="relaxed-surface overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Kiosker</h2>
        <p className="text-sm text-slate-600">
          Alla kiosker på plattformen med licensstatus och aktivitet senaste 7 dagar.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Förening</th>
              <th className="px-5 py-3 font-semibold">Kiosk</th>
              <th className="px-5 py-3 font-semibold">Lag</th>
              <th className="px-5 py-3 font-semibold">Slug</th>
              <th className="px-5 py-3 font-semibold">Swish</th>
              <th className="px-5 py-3 font-semibold">Licens</th>
              <th className="px-5 py-3 font-semibold">7d köp</th>
              <th className="px-5 py-3 font-semibold">Senaste försäljning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shops.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-600">
                  Inga kiosker skapade ännu.
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr key={shop.shopId}>
                  <td className="px-5 py-4 text-slate-700">{shop.organizationName}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{shop.shopName}</td>
                  <td className="px-5 py-4 text-slate-700">{shop.teamLabel ?? '—'}</td>
                  <td className="px-5 py-4">
                    <Link
                      to="/s/$shopSlug"
                      params={{ shopSlug: shop.slug }}
                      className="cursor-pointer font-semibold text-brand underline decoration-brand/30 underline-offset-4"
                    >
                      {shop.slug}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{shop.swishNumber}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        shop.licenseActive
                          ? 'bg-green-50 text-green-700 ring-green-200'
                          : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }`}
                    >
                      {shop.licenseActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {shop.verifiedTransactionCount7d}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {shop.lastVerifiedSaleAt !== null
                      ? formatDateTime(shop.lastVerifiedSaleAt)
                      : '—'}
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
