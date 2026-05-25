import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/catalog/')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard/admin/catalog/categories',
    })
  },
})
