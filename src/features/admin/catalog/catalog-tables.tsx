import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'

import { TableCell, TableRow } from '#/components/ui/table'

import {
  CatalogTable,
  RowActions,
  StatusCell,
} from './catalog-shared'

export function BrandsTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: {
  items: AdminBrand[]
  isLoading: boolean
  onEdit: (item: AdminBrand) => void
  onDelete: (item: AdminBrand) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'اسلاگ', 'وب‌سایت', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
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
  isLoading,
  onEdit,
  onDelete,
}: {
  items: AdminCategory[]
  isLoading: boolean
  onEdit: (item: AdminCategory) => void
  onDelete: (item: AdminCategory) => void
}) {
  const byId = new Map(items.map(item => [item.id, item]))

  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'والد', 'اسلاگ', 'ترتیب', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            {item.parentId ? byId.get(item.parentId)?.name ?? '-' : '-'}
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
  onEdit,
  onDelete,
}: {
  items: AdminAttribute[]
  isLoading: boolean
  onEdit: (item: AdminAttribute) => void
  onDelete: (item: AdminAttribute) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'کد', 'نوع', 'محدوده', 'فیلتر', 'تنوع', 'مقادیر', 'عملیات']}
      isEmpty={items.length === 0}
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
  onEdit,
  onDelete,
}: {
  items: AdminCollection[]
  isLoading: boolean
  onEdit: (item: AdminCollection) => void
  onDelete: (item: AdminCollection) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'اسلاگ', 'نوع', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
    >
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell className="text-xs">{item.slug}</TableCell>
          <TableCell>{item.type}</TableCell>
          <StatusCell active={item.isActive} />
          <RowActions
            editLabel="ویرایش کالکشن"
            deleteLabel="حذف کالکشن"
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </TableRow>
      ))}
    </CatalogTable>
  )
}

export function TagsTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: {
  items: AdminTag[]
  isLoading: boolean
  onEdit: (item: AdminTag) => void
  onDelete: (item: AdminTag) => void
}) {
  return (
    <CatalogTable
      isLoading={isLoading}
      columns={['نام', 'اسلاگ', 'نوع', 'رنگ', 'وضعیت', 'عملیات']}
      isEmpty={items.length === 0}
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
