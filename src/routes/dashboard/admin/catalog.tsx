import { createFileRoute } from '@tanstack/react-router'

import { AdminCatalogPage } from '#/features/admin/catalog/admin-catalog-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog')({
  staticData: routeBreadcrumb('کاتالوگ'),
  component: AdminCatalogPage,
})
