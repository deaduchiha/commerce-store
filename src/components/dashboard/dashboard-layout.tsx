import type { getSession } from '#/lib/auth.functions'

import { Outlet } from '@tanstack/react-router'
import { AppSidebar } from '#/components/dashboard/app-sidebar'
import { DashboardBreadcrumb } from '#/components/dashboard/dashboard-breadcrumb'
import { Separator } from '#/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'

type DashboardSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

interface DashboardLayoutProps {
  session: DashboardSession
}

export function DashboardLayout({ session }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ms-1" />

          <Separator
            orientation="vertical"
            className="h-full"
          />

          {/* breadcrumbs */}
          <DashboardBreadcrumb />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
