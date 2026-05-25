import { createFileRoute } from '@tanstack/react-router'

import { AdminBrandsPage } from '#/features/admin/catalog/pages/admin-brands-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog/brands')({
  staticData: routeBreadcrumb('برندها'),
  component: AdminBrandsPage,
})
