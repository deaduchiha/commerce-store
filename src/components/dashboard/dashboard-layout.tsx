import type { ReactNode } from 'react'

import type { getSession } from '#/lib/auth.functions'
import { AppSidebar } from '#/components/dashboard/app-sidebar'
import { Separator } from '#/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'

type DashboardSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

interface DashboardLayoutProps {
  session: DashboardSession
  title?: string
  children: ReactNode
}

export function DashboardLayout({
  session,
  title = 'Dashboard',
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator
            orientation="vertical"
            className="me-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-sm font-medium">{title}</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
