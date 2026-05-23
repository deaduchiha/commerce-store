import { AdminProductEditor } from '#/features/admin/products/admin-product-editor'

interface AdminProductFormPageProps {
  mode: 'create' | 'edit'
  productId?: string
}

export function AdminProductFormPage(props: AdminProductFormPageProps) {
  return <AdminProductEditor {...props} />
}
