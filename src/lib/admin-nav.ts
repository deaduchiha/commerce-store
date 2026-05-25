import type { LucideIcon } from 'lucide-react'
import type { FileRouteTypes } from '#/routeTree.gen'
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  Package,
  Users,
} from 'lucide-react'

export type AdminNavTo = Extract<
  FileRouteTypes['to'],
  `/dashboard/admin${string}`
>

export interface AdminNavItem {
  title: string
  to: AdminNavTo
  icon: LucideIcon
  /** Prefix match for nested routes (e.g. products edit). */
  matchPrefix?: boolean
}

export function isAdminNavActive(pathname: string, item: AdminNavItem) {
  if (item.matchPrefix) {
    return pathname.startsWith(item.to)
  }

  if (item.to === '/dashboard/admin') {
    return pathname === '/dashboard/admin' || pathname === '/dashboard/admin/'
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export const adminNavItems: AdminNavItem[] = [
  {
    title: 'خلاصه',
    to: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'کاربران',
    to: '/dashboard/admin/users',
    icon: Users,
  },
  {
    title: 'پرداخت‌ها',
    to: '/dashboard/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'محصولات',
    to: '/dashboard/admin/products',
    icon: Package,
    matchPrefix: true,
  },
  {
    title: 'کاتالوگ',
    to: '/dashboard/admin/catalog',
    icon: Boxes,
    matchPrefix: true,
  },
]
