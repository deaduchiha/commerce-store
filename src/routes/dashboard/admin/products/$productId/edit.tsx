import { createFileRoute } from '@tanstack/react-router'

import { AdminProductFormPage } from '#/features/admin/products/admin-product-form-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute(
  '/dashboard/admin/products/$productId/edit',
)({
  staticData: routeBreadcrumb('ویرایش محصول'),
  component: EditProductPage,
})

function EditProductPage() {
  const { productId } = Route.useParams()

  return <AdminProductFormPage mode="edit" productId={productId} />
}
