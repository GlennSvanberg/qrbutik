import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$shopSlug')({
  component: ShopLayout,
})

function ShopLayout() {
  return <Outlet />
}
