import type { getSession } from '#/lib/auth.functions'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'

import { LayoutDashboard, LogOut, MapPin, User } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from '#/components/ui/sidebar'
import { authClient } from '#/lib/auth-client'

type DashboardSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

const mainNavItems = [
  { title: 'Dashboard', to: '/dashboard' as const, icon: LayoutDashboard },
]

const settingsNavItems = [
  { title: 'پروفایل', to: '/dashboard/settings/profile' as const, icon: User },
  {
    title: 'آدرس‌ها',
    to: '/dashboard/settings/address-profile' as const,
    icon: MapPin,
  },
]

interface AppSidebarProps {
  session: DashboardSession
}

export function AppSidebar({ session }: AppSidebarProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const displayName = session.user.phoneNumber ?? session.user.name ?? 'User'
  const initial = displayName.charAt(0).toUpperCase()

  function isActive(to: string) {
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <Sidebar side="right">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-bold">S</span>
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">Sneakstore</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(item => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.title}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>تنظیمات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map(item => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.title}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <span className="text-xs font-medium">{initial}</span>
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70 capitalize">
                  {session.user.role ?? 'user'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      void navigate({ to: '/login' })
                    },
                  },
                })
              }}
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}
