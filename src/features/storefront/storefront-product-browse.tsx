import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { buildCategoryTreeOptions } from '#/lib/catalog-categories'
import { orpc } from '#/orpc/client'

const ALL = '__all__'

function formatTomansFromRials(value: number | null) {
  if (value == null) {
    return null
  }

  return `${Math.round(value / 10).toLocaleString('fa-IR')} تومان`
}

export function StorefrontProductBrowse() {
  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState<string>()
  const [categoryId, setCategoryId] = useState<string>()
  const [tagId, setTagId] = useState<string>()
  const [pageIndex, setPageIndex] = useState(0)

  const filtersQuery = useQuery(
    orpc.storefront.catalog.filterOptions.queryOptions(),
  )

  const listQuery = useQuery(
    orpc.storefront.products.list.queryOptions({
      input: {
        pageIndex,
        pageSize: 12,
        search: search.trim() || undefined,
        brandId,
        categoryId,
        tagId,
      },
    }),
  )

  const categoryOptions = useMemo(
    () => buildCategoryTreeOptions(filtersQuery.data?.categories ?? []),
    [filtersQuery.data?.categories],
  )

  function resetFilters() {
    setSearch('')
    setBrandId(undefined)
    setCategoryId(undefined)
    setTagId(undefined)
    setPageIndex(0)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">فروشگاه</h1>
        <p className="text-muted-foreground text-sm">
          فیلتر بر اساس برند، دسته‌بندی و تگ‌های فعال کاتالوگ
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="جستجوی نام یا اسلاگ"
          value={search}
          onChange={event => {
            setSearch(event.target.value)
            setPageIndex(0)
          }}
        />
        <Select
          value={brandId ?? ALL}
          onValueChange={(value) => {
            setBrandId(value === ALL ? undefined : value)
            setPageIndex(0)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="برند" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>همه برندها</SelectItem>
            {(filtersQuery.data?.brands ?? []).map(brand => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryId ?? ALL}
          onValueChange={(value) => {
            setCategoryId(value === ALL ? undefined : value)
            setPageIndex(0)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>همه دسته‌ها</SelectItem>
            {categoryOptions.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={tagId ?? ALL}
          onValueChange={(value) => {
            setTagId(value === ALL ? undefined : value)
            setPageIndex(0)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="تگ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>همه تگ‌ها</SelectItem>
            {(filtersQuery.data?.tags ?? []).map(tag => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={resetFilters}>
          پاک کردن فیلترها
        </Button>
      </div>

      {listQuery.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      )}

      {!listQuery.isPending && listQuery.data?.items.length === 0 && (
        <p className="text-muted-foreground border p-6 text-sm">
          محصولی با این فیلترها پیدا نشد.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(listQuery.data?.items ?? []).map(product => (
          <article key={product.id} className="flex flex-col gap-3 border p-4">
            {product.imagePath
              ? (
                  <img
                    src={product.imagePath}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                )
              : (
                  <div className="bg-muted flex aspect-square items-center justify-center text-xs text-muted-foreground">
                    بدون تصویر
                  </div>
                )}
            <div className="space-y-1">
              <h2 className="font-semibold">{product.name}</h2>
              {product.brand && (
                <p className="text-muted-foreground text-sm">{product.brand}</p>
              )}
              {product.minPriceInRials != null && (
                <p className="text-sm">
                  از
                  {' '}
                  {formatTomansFromRials(product.minPriceInRials)}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {listQuery.data && listQuery.data.pageCount > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={pageIndex <= 0}
            onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
          >
            قبلی
          </Button>
          <span className="text-sm">
            صفحه
            {' '}
            {(pageIndex + 1).toLocaleString('fa-IR')}
            {' '}
            از
            {' '}
            {listQuery.data.pageCount.toLocaleString('fa-IR')}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={pageIndex + 1 >= listQuery.data.pageCount}
            onClick={() => setPageIndex(prev => prev + 1)}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  )
}
