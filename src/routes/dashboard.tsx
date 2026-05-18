import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '#/components/dashboard/dashboard-layout'
import { routeBreadcrumb } from '#/lib/breadcrumb'
import { dashboardBeforeLoad } from '#/lib/dashboard-route'

export const Route = createFileRoute('/dashboard')({
  staticData: routeBreadcrumb('داشبورد'),
  beforeLoad: dashboardBeforeLoad,
  component: DashboardLayoutRoute,
})

function DashboardLayoutRoute() {
  const { session } = Route.useRouteContext()

  return <DashboardLayout session={session} />
}
