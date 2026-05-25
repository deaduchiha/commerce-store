import { createFileRoute } from '@tanstack/react-router'

import { AdminCollectionsPage } from '#/features/admin/catalog/pages/admin-collections-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/catalog/collections')({
  staticData: routeBreadcrumb('کالکشن‌ها'),
  component: AdminCollectionsPage,
})
