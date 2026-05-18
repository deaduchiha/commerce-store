import { createFileRoute, Outlet } from '@tanstack/react-router'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/settings')({
  staticData: routeBreadcrumb('تنظیمات', { link: false }),
  component: SettingsLayoutRoute,
})

function SettingsLayoutRoute() {
  return <Outlet />
}
