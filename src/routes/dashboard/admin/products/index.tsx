import { createFileRoute } from '@tanstack/react-router'

import { AdminProductsPage } from '#/features/admin/products/admin-products-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/products/')({
  staticData: routeBreadcrumb('محصولات'),
  component: AdminProductsPage,
})
