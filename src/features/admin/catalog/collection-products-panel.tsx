import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { invalidateCatalogProductQueries } from '#/lib/catalog-invalidation'
import { orpc } from '#/orpc/client'

export function CollectionProductsPanel({
  collectionId,
  collectionName,
  collectionType,
}: {
  collectionId: string
  collectionName: string
  collectionType: 'manual' | 'smart'
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const productsQuery = useQuery(
    orpc.admin.catalog.listCollectionProducts.queryOptions({
      input: { collectionId },
    }),
  )
  const allProductsQuery = useQuery(
    orpc.admin.products.list.queryOptions({
      input: { pageIndex: 0, pageSize: 50, search: search || undefined },
    }),
  )

  const [draftIds, setDraftIds] = useState<string[]>([])

  const saveMutation = useMutation(
    orpc.admin.catalog.setCollectionProducts.mutationOptions({
      onSuccess: async () => {
        await invalidateCatalogProductQueries(queryClient)
        await queryClient.invalidateQueries({
          queryKey: orpc.admin.catalog.listCollectionProducts.key({
            input: { collectionId },
          }),
        })
        toast.success('محصولات کالکشن ذخیره شد.')
        setOpen(false)
      },
      onError: () => toast.error('ذخیره محصولات کالکشن انجام نشد.'),
    }),
  )

  if (collectionType !== 'manual') {
    return null
  }

  return (
    <div className="flex flex-col gap-3 border bg-muted/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">محصولات کالکشن</h3>
          <p className="text-muted-foreground text-sm">
            {collectionName}
            {' '}
            —
            {' '}
            {(productsQuery.data?.length ?? 0).toLocaleString('fa-IR')}
            {' '}
            محصول
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDraftIds([...(productsQuery.data ?? []).map(item => item.id)])
            setOpen(true)
          }}
        >
          مدیریت محصولات
        </Button>
      </div>

      {productsQuery.isPending
        ? <Skeleton className="h-20 w-full" />
        : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {(productsQuery.data ?? []).map(item => (
                <li key={item.id} className="border bg-background px-3 py-2 text-sm">
                  {item.name}
                </li>
              ))}
            </ul>
          )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>محصولات کالکشن</DialogTitle>
            <DialogDescription>
              محصولات دستی این کالکشن را انتخاب کنید.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="جستجو محصول"
            aria-label="جستجو محصول"
          />

          <div className="max-h-80 overflow-y-auto border">
            {allProductsQuery.isPending
              ? <Skeleton className="h-40 w-full" />
              : (
                  <ul className="divide-y">
                    {(allProductsQuery.data?.items ?? []).map((product) => {
                      const checked = draftIds.includes(product.id)

                      return (
                        <li key={product.id}>
                          <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/40">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setDraftIds((current) => {
                                  if (current.includes(product.id)) {
                                    return current.filter(id => id !== product.id)
                                  }

                                  return [...current, product.id]
                                })
                              }}
                            />
                            <span className="text-sm">{product.name}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => {
                void saveMutation.mutateAsync({
                  collectionId,
                  productIds: draftIds,
                })
              }}
            >
              ذخیره
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
