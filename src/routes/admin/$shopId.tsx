import { Outlet, createFileRoute } from '@tanstack/react-router'

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
  return <Outlet />
}
