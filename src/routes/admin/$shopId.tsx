import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/$shopId')({
  component: AdminShopLayout,
})

function AdminShopLayout() {
  return <Outlet />
}
