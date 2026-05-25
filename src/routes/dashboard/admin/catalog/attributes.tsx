import { createFileRoute } from '@tanstack/react-router'

import { AdminAttributesPage } from '#/features/admin/catalog/pages/admin-attributes-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog/attributes')({
  staticData: routeBreadcrumb('ویژگی‌ها'),
  component: AdminAttributesPage,
})
