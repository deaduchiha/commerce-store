import { Outlet } from '@tanstack/react-router'

export function AdminLayout() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Outlet />
    </div>
  )
}
