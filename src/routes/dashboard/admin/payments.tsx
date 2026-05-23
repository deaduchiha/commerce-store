import { createFileRoute } from '@tanstack/react-router'

import { AdminPaymentsPage } from '#/features/admin/payments/admin-payments-page'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/payments')({
  staticData: routeBreadcrumb('پرداخت‌ها'),
  component: AdminPaymentsPage,
})
