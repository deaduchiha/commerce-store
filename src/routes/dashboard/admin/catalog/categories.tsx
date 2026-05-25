import { createFileRoute } from '@tanstack/react-router'

import { AdminCategoriesPage } from '#/features/admin/catalog/pages/admin-categories-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog/categories')({
  staticData: routeBreadcrumb('دسته‌بندی‌ها'),
  component: AdminCategoriesPage,
})
