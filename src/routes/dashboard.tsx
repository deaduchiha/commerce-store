import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { DashboardLayout } from '#/components/dashboard/dashboard-layout'
import { dashboardBeforeLoad } from '#/lib/dashboard-route'

function getDashboardTitle(pathname: string) {
  if (pathname.startsWith('/dashboard/settings')) {
    return 'تنظیمات'
  }
  return 'Dashboard'
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: dashboardBeforeLoad,
  component: DashboardLayoutRoute,
})

function DashboardLayoutRoute() {
  const { session } = Route.useRouteContext()
  const pathname = useRouterState({ select: state => state.location.pathname })
  const title = getDashboardTitle(pathname)

  return (
    <DashboardLayout session={session} title={title}>
      <Outlet />
    </DashboardLayout>
  )
}
