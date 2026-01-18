import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/utforska/$sport')({
  component: SportLayout,
})

function SportLayout() {
  return <Outlet />
}
