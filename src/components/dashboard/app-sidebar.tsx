import type { getSession } from '#/lib/auth.functions'
import type { UserRole } from '#/lib/roles'

import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '#/components/ui/sidebar'
import {
  adminCatalogNavItems,
  isAdminCatalogNavActive,
} from '#/lib/admin-catalog-nav'
import { adminNavItems, isAdminNavActive } from '#/lib/admin-nav'
import { authClient } from '#/lib/auth-client'
import { hasMinRole } from '#/lib/roles'

type DashboardSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

const mainNavItems: Array<{
  title: string
  to: '/dashboard' | '/dashboard/profile'
  icon: typeof LayoutDashboard
  minRole: UserRole
}> = [
  {
    title: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    minRole: 'user',
  },
  {
    title: 'پروفایل',
    to: '/dashboard/profile',
    icon: User,
    minRole: 'user',
  },
]

interface AppSidebarProps {
  session: DashboardSession
}

export function AppSidebar({ session }: AppSidebarProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const displayName = session.user.name ?? ''

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
              {mainNavItems
                .filter(item => hasMinRole(session.user.role, item.minRole))
                .map(item => (
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

        {hasMinRole(session.user.role, 'admin') && (
          <SidebarGroup>
            <SidebarGroupLabel>مدیریت</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map(item => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isAdminNavActive(pathname, item)}
                      tooltip={item.title}
                    >
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="کاتالوگ"
                    isActive={pathname.startsWith('/dashboard/admin/catalog')}
                  >
                    <Link to="/dashboard/admin/catalog/categories">
                      {/* <adminCatalogNavItems[0]!.icon /> */}
                      <span>کاتالوگ</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {adminCatalogNavItems.map(item => (
                      <SidebarMenuSubItem key={item.to}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isAdminCatalogNavActive(pathname, item)}
                        >
                          <Link to={item.to}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <Avatar>
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70 capitalize">
                  {session.user.phoneNumber}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="destructive"
              className="w-full"
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
              <span>خروج از حساب کاربری</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}
