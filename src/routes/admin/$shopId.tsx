import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AdminShopShell } from '../../components/AdminShopShell'
import { ShopAccessGate } from '../../components/auth/ShopAccessGate'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/$shopId')({
  head: () => ({
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  headers: () => ({
    'X-Robots-Tag': 'noindex, nofollow',
  }),
  component: AdminShopLayout,
})

function AdminShopLayout() {
  const { shopId } = Route.useParams()

  return (
    <ShopAccessGate shopId={shopId as Id<'shops'>}>
      <AdminShopShell shopId={shopId as Id<'shops'>}>
        <Outlet />
      </AdminShopShell>
    </ShopAccessGate>
  )
}
