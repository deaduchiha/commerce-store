import { createFileRoute, Outlet } from '@tanstack/react-router'

import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog')({
  staticData: routeBreadcrumb('کاتالوگ', { link: false }),
  component: CatalogLayout,
})

function CatalogLayout() {
  return <Outlet />
}
