import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'

import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { TableCell, TableRow } from '#/components/ui/table'

import {
  CatalogTable,
  RowActions,
  StatusCell,
} from './catalog-shared'

export function BrandsTable({
  items,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
}: {
  items: AdminBrand[]
  isLoading: boolean
  emptyMessage?: string
  onEdit: (item: AdminBrand) => void
  onDelete: (item: AdminBrand) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'اسلاگ', 'وب‌سایت', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
      emptyMessage={emptyMessage}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell className="text-xs">{item.slug}</TableCell>
          <TableCell>{item.websiteUrl ?? '-'}</TableCell>
          <StatusCell active={item.isActive} />
          <RowActions
            editLabel="ویرایش برند"
            deleteLabel="حذف برند"
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </TableRow>
      ))}
    </CatalogTable>
  )
}

export function CategoriesTable({
  items,
  parentById,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
}: {
  items: AdminCategory[]
  parentById: Map<string, AdminCategory>
  isLoading: boolean
  emptyMessage?: string
  onEdit: (item: AdminCategory) => void
  onDelete: (item: AdminCategory) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'والد', 'اسلاگ', 'ترتیب', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
      emptyMessage={emptyMessage}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            {item.parentId ? parentById.get(item.parentId)?.name ?? '-' : '-'}
          </TableCell>
          <TableCell className="text-xs">{item.slug}</TableCell>
          <TableCell>{item.sortOrder.toLocaleString('fa-IR')}</TableCell>
          <StatusCell active={item.isActive} />
          <RowActions
            editLabel="ویرایش دسته‌بندی"
            deleteLabel="حذف دسته‌بندی"
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </TableRow>
      ))}
    </CatalogTable>
  )
}

export function AttributesTable({
  items,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
}: {
  items: AdminAttribute[]
  isLoading: boolean
  emptyMessage?: string
  onEdit: (item: AdminAttribute) => void
  onDelete: (item: AdminAttribute) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'کد', 'نوع', 'محدوده', 'فیلتر', 'تنوع', 'مقادیر', 'عملیات']}
      isEmpty={items.length === 0}
      emptyMessage={emptyMessage}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell className="text-xs">{item.code}</TableCell>
          <TableCell>{item.type}</TableCell>
          <TableCell>{item.scope}</TableCell>
          <TableCell>{item.isFilterable ? 'بله' : 'خیر'}</TableCell>
          <TableCell>{item.isVariantOption ? 'بله' : 'خیر'}</TableCell>
          <TableCell>{item.values.length.toLocaleString('fa-IR')}</TableCell>
          <RowActions
            editLabel="ویرایش ویژگی"
            deleteLabel="حذف ویژگی"
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </TableRow>
      ))}
    </CatalogTable>
  )
}

export function CollectionsTable({
  items,
  isLoading,
  emptyMessage,
  onEdit,
  onManageProducts,
  onDelete,
}: {
  items: AdminCollection[]
  isLoading: boolean
  emptyMessage?: string
  onEdit: (item: AdminCollection) => void
  onManageProducts?: (item: AdminCollection) => void
  onDelete: (item: AdminCollection) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'اسلاگ', 'نوع', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
      emptyMessage={emptyMessage}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell className="text-xs">{item.slug}</TableCell>
          <TableCell>{item.type}</TableCell>
          <StatusCell active={item.isActive} />
          <TableCell>
            <div className="flex flex-wrap gap-2">
              {item.type === 'manual' && onManageProducts && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onManageProducts(item)}
                >
                  محصولات
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => onEdit(item)}
              >
                <Pencil />
                <span className="sr-only">ویرایش کالکشن</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => onDelete(item)}
              >
                <Trash2 />
                <span className="sr-only">حذف کالکشن</span>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </CatalogTable>
  )
}

export function TagsTable({
  items,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
}: {
  items: AdminTag[]
  isLoading: boolean
  emptyMessage?: string
  onEdit: (item: AdminTag) => void
  onDelete: (item: AdminTag) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'اسلاگ', 'نوع', 'رنگ', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
      emptyMessage={emptyMessage}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell className="text-xs">{item.slug}</TableCell>
          <TableCell>{item.type}</TableCell>
          <TableCell>
            {item.color
              ? <span className="text-xs">{item.color}</span>
              : '-'}
          </TableCell>
          <StatusCell active={item.isActive} />
          <RowActions
            editLabel="ویرایش تگ"
            deleteLabel="حذف تگ"
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </TableRow>
      ))}
    </CatalogTable>
  )
}
