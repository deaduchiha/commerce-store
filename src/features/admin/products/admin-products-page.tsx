import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { toast } from 'sonner'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from '#/components/admin/data-table'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Skeleton } from '#/components/ui/skeleton'
import { orpc } from '#/orpc/client'

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const productsQuery = useQuery(orpc.admin.products.list.queryOptions())

  const deleteMutation = useMutation(
    orpc.admin.products.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.admin.products.list.key(),
        })
        toast.success('محصول حذف شد.')
        setDeleteId(null)
      },
      onError: () => {
        toast.error('حذف محصول انجام نشد.')
      },
    }),
  )

  if (productsQuery.isPending) {
    return <Skeleton className="h-64 w-full" />
  }

  if (productsQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        بارگذاری محصولات با خطا مواجه شد.
      </p>
    )
  }

  const products = productsQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="محصولات"
          description="افزودن، ویرایش و حذف محصولات"
        />
        <Button asChild className="shrink-0">
          <Link to="/dashboard/admin/products/new">
            <Plus />
            محصول جدید
          </Link>
        </Button>
      </div>

      <DataTable
        columns={['تصویر', 'نام', 'برند', 'اسلاگ', 'تنوع', 'وضعیت', 'عملیات']}
        isEmpty={products.length === 0}
        emptyMessage="محصولی ثبت نشده است."
      >
        {products.map(product => (
          <DataTableRow key={product.id}>
            <DataTableCell>
              {product.imagePath
                ? (
                    <img
                      src={product.imagePath}
                      alt=""
                      className="size-10 rounded-md border object-cover"
                    />
                  )
                : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
            </DataTableCell>
            <DataTableCell className="font-medium">{product.name}</DataTableCell>
            <DataTableCell>{product.brand ?? '—'}</DataTableCell>
            <DataTableCell className="font-mono text-xs">{product.slug}</DataTableCell>
            <DataTableCell>{product.variantCount}</DataTableCell>
            <DataTableCell>
              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                {product.isActive ? 'فعال' : 'غیرفعال'}
              </Badge>
            </DataTableCell>
            <DataTableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="icon-sm" asChild>
                  <Link
                    to="/dashboard/admin/products/$productId/edit"
                    params={{ productId: product.id }}
                  >
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setDeleteId(product.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف محصول</DialogTitle>
            <DialogDescription>
              این عمل قابل بازگشت نیست. همه تنوع‌های محصول نیز حذف می‌شوند.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              انصراف
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate({ id: deleteId })
                }
              }}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
