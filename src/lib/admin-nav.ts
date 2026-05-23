import type { FileRouteTypes } from '#/routeTree.gen'
import type { LucideIcon } from 'lucide-react'
import {
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
]
