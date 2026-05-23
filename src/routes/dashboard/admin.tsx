import { createFileRoute } from '@tanstack/react-router'

import { AdminLayout } from '#/components/admin/admin-layout'
import { routeBreadcrumb } from '#/lib/breadcrumb'
import { requireRoleBeforeLoad } from '#/lib/route-auth'

export const Route = createFileRoute('/dashboard/admin')({
  staticData: routeBreadcrumb('مدیریت', { link: false }),
  beforeLoad: requireRoleBeforeLoad('admin'),
  component: AdminLayout,
})
