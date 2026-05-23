import { Outlet } from '@tanstack/react-router'

import { AdminNav } from '#/components/admin/admin-nav'

export function AdminLayout() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">پنل مدیریت</h1>
        <p className="text-muted-foreground text-sm">
          مدیریت کاربران، پرداخت‌ها و محصولات فروشگاه
        </p>
      </div>
      <AdminNav />
      <Outlet />
    </div>
  )
}
