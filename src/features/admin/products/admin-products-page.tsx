import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import type { AdminProductListItem } from '#/orpc/schemas/admin/products'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminPageHeader } from '#/components/admin/admin-page-header'
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
import { Input } from '#/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { orpc } from '#/orpc/client'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const productsQuery = useQuery({
    ...orpc.admin.products.list.queryOptions({
      input: {
        ...pagination,
        search: search.trim() || undefined,
      },
    }),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    const pageCount = productsQuery.data?.pageCount
    if (
      pageCount !== undefined
      && pagination.pageIndex > 0
      && pagination.pageIndex >= pageCount
    ) {
      setPagination(current => ({
        ...current,
        pageIndex: Math.max(pageCount - 1, 0),
      }))
    }
  }, [pagination.pageIndex, productsQuery.data?.pageCount])

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

  const columns = useMemo<ColumnDef<AdminProductListItem>[]>(
    () => [
      {
        accessorKey: 'imagePath',
        header: 'تصویر',
        cell: ({ row }) => {
          const product = row.original

          return product.imagePath
            ? (
                <img
                  src={product.imagePath}
                  alt=""
                  className="size-11 border object-cover"
                />
              )
            : (
                <span className="text-muted-foreground text-xs">-</span>
              )
        },
      },
      {
        accessorKey: 'name',
        header: 'نام',
        cell: ({ row }) => (
          <div className="min-w-48">
            <div className="font-medium">{row.original.name}</div>
            <div className="text-muted-foreground text-xs">
              {row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'brandName',
        header: 'برند',
        cell: ({ row }) => row.original.brandName ?? '-',
      },
      {
        accessorKey: 'variantCount',
        header: 'تنوع',
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.variantCount.toLocaleString('fa-IR')}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'وضعیت',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'فعال' : 'غیرفعال'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link
                to="/dashboard/admin/products/$productId/edit"
                params={{ productId: row.original.id }}
              >
                <Pencil />
                <span className="sr-only">ویرایش محصول</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 />
              <span className="sr-only">حذف محصول</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const products = productsQuery.data?.items ?? []
  const table = useReactTable({
    data: products,
    columns,
    manualPagination: true,
    rowCount: productsQuery.data?.total ?? 0,
    pageCount: productsQuery.data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

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

      <div className="flex flex-col gap-3 border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPagination(current => ({
                ...current,
                pageIndex: 0,
              }))
            }}
            className="ps-8"
            placeholder="جستجو نام، اسلاگ یا برند"
            aria-label="جستجو محصولات"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {productsQuery.data?.total.toLocaleString('fa-IR') ?? '۰'}
            {' '}
            نتیجه
          </span>
          {search.trim() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setPagination(current => ({
                  ...current,
                  pageIndex: 0,
                }))
              }}
            >
              <X />
              پاک کردن
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length
              ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )
              : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-muted-foreground h-24 text-center"
                    >
                      {search.trim()
                        ? 'محصولی با این جستجو پیدا نشد.'
                        : 'محصولی ثبت نشده است.'}
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">تعداد در صفحه</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={value => setPagination({
              pageIndex: 0,
              pageSize: Number(value),
            })}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size.toLocaleString('fa-IR')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground text-sm">
          صفحه
          {' '}
          {(pagination.pageIndex + 1).toLocaleString('fa-IR')}
          {' '}
          از
          {' '}
          {Math.max(productsQuery.data?.pageCount ?? 1, 1).toLocaleString('fa-IR')}
        </div>

        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="قبلی"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                text="بعدی"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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
