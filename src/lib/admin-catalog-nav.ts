import type { LucideIcon } from 'lucide-react'
import type { FileRouteTypes } from '#/routeTree.gen'
import { Boxes, FolderTree, Layers3, Tags } from 'lucide-react'

export type AdminCatalogNavTo = Extract<
  FileRouteTypes['to'],
  `/dashboard/admin/catalog/${string}`
>

export interface AdminCatalogNavItem {
  title: string
  description: string
  searchPlaceholder: string
  to: AdminCatalogNavTo
  icon: LucideIcon
}

export const adminCatalogNavItems: AdminCatalogNavItem[] = [
  {
    title: 'دسته‌بندی‌ها',
    description: 'ساختار چندسطحی کاتالوگ',
    searchPlaceholder: 'جستجو نام یا اسلاگ دسته‌بندی',
    to: '/dashboard/admin/catalog/categories',
    icon: FolderTree,
  },
  {
    title: 'برندها',
    description: 'برندهای قابل اتصال به محصول',
    searchPlaceholder: 'جستجو نام یا اسلاگ برند',
    to: '/dashboard/admin/catalog/brands',
    icon: Boxes,
  },
  {
    title: 'ویژگی‌ها',
    description: 'فیلترها و گزینه‌های تنوع محصول',
    searchPlaceholder: 'جستجو نام یا کد ویژگی',
    to: '/dashboard/admin/catalog/attributes',
    icon: Layers3,
  },
  {
    title: 'کالکشن‌ها',
    description: 'گروه‌های دستی یا هوشمند محصول',
    searchPlaceholder: 'جستجو نام یا اسلاگ کالکشن',
    to: '/dashboard/admin/catalog/collections',
    icon: Boxes,
  },
  {
    title: 'تگ‌ها و لیبل‌ها',
    description: 'New، Featured، Best Seller و...',
    searchPlaceholder: 'جستجو نام یا اسلاگ تگ',
    to: '/dashboard/admin/catalog/tags',
    icon: Tags,
  },
]

export function getAdminCatalogNavItem(to: AdminCatalogNavTo) {
  const item = adminCatalogNavItems.find(entry => entry.to === to)
  if (!item) {
    throw new Error(`Unknown catalog route: ${to}`)
  }

  return item
}

export function isAdminCatalogNavActive(pathname: string, item: AdminCatalogNavItem) {
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}
