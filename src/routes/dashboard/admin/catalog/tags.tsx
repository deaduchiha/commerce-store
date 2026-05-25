import { createFileRoute } from '@tanstack/react-router'

import { AdminTagsPage } from '#/features/admin/catalog/pages/admin-tags-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog/tags')({
  staticData: routeBreadcrumb('تگ‌ها و لیبل‌ها'),
  component: AdminTagsPage,
})
