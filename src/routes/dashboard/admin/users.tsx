import { createFileRoute } from '@tanstack/react-router'

import { AdminUsersPage } from '#/features/admin/users/admin-users-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/users')({
  staticData: routeBreadcrumb('کاربران'),
  component: AdminUsersPage,
})
