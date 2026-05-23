import { createFileRoute } from '@tanstack/react-router'

import { AdminProductFormPage } from '#/features/admin/products/admin-product-form-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/products/new')({
  staticData: routeBreadcrumb('محصول جدید'),
  component: NewProductPage,
})

function NewProductPage() {
  return <AdminProductFormPage mode="create" />
}
