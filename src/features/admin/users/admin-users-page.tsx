import type { AssignableUserRole, UserRole } from '#/lib/roles'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from '#/components/admin/data-table'
import { Badge } from '#/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { ASSIGNABLE_USER_ROLES } from '#/lib/roles'
import { orpc } from '#/orpc/client'

const roleLabels: Record<UserRole, string> = {
  user: 'کاربر',
  author: 'نویسنده',
  admin: 'مدیر',
}

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const usersQuery = useQuery(orpc.admin.users.list.queryOptions())

  const updateRoleMutation = useMutation(
    orpc.admin.users.updateRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.admin.users.list.key(),
        })
        toast.success('نقش کاربر به‌روزرسانی شد.')
      },
      onError: () => {
        toast.error('به‌روزرسانی نقش انجام نشد.')
      },
    }),
  )

  if (usersQuery.isPending) {
    return <Skeleton className="h-64 w-full" />
  }

  if (usersQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        بارگذاری کاربران با خطا مواجه شد.
      </p>
    )
  }

  const users = usersQuery.data

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="کاربران" description="مشاهده و تغییر نقش کاربران" />
      <DataTable
        columns={['نام', 'ایمیل', 'موبایل', 'نقش', 'تاریخ عضویت']}
        isEmpty={users.length === 0}
      >
        {users.map(user => (
          <DataTableRow key={user.id}>
            <DataTableCell>{user.name}</DataTableCell>
            <DataTableCell className="text-xs">{user.email}</DataTableCell>
            <DataTableCell>{user.phoneNumber ?? '—'}</DataTableCell>
            <DataTableCell>
              {user.role === 'admin'
                ? (
                    <Badge variant="secondary">{roleLabels.admin}</Badge>
                  )
                : (
                    <Select
                      value={user.role}
                      disabled={updateRoleMutation.isPending}
                      onValueChange={(role: AssignableUserRole) => {
                        updateRoleMutation.mutate({
                          userId: user.id,
                          role,
                        })
                      }}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_USER_ROLES.map(role => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
            </DataTableCell>
            <DataTableCell>
              {new Date(user.createdAt).toLocaleDateString('fa-IR')}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </div>
  )
}
