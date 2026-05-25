import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useCatalogSearch } from '#/components/admin/catalog/catalog-search-context'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { invalidateCatalogProductQueries } from '#/lib/catalog-invalidation'
import { orpc } from '#/orpc/client'

import {
  AttributeForm,
  attributeToForm,
  BrandForm,
  brandToForm,
  CategoryForm,
  categoryToForm,
  CollectionForm,
  collectionToForm,
  emptyAttributeForm,
  emptyBrandForm,
  emptyCategoryForm,
  emptyCollectionForm,
  emptyTagForm,
  TagForm,
  tagToForm,
} from './catalog-forms'
import {
  CatalogSectionActions,
  DeleteCatalogDialog,
} from './catalog-shared'
import {
  AttributesTable,
  BrandsTable,
  CategoriesTable,
  CollectionsTable,
  TagsTable,
} from './catalog-tables'
import { CollectionProductsPanel } from './collection-products-panel'

const searchEmptyMessage = 'موردی با این جستجو پیدا نشد.'
const defaultEmptyMessage = 'موردی ثبت نشده است.'

function useCatalogListQuery<T extends Array<unknown>>(
  data: T | undefined,
  isPending: boolean,
) {
  const { debouncedSearch, isSearchActive, setResultCount } = useCatalogSearch()

  useEffect(() => {
    if (!isPending) {
      setResultCount(data?.length ?? 0)
    }
  }, [data?.length, isPending, setResultCount])

  return {
    debouncedSearch,
    emptyMessage: isSearchActive ? searchEmptyMessage : defaultEmptyMessage,
  }
}

export function BrandsSection() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<AdminBrand | null>(null)
  const [deleting, setDeleting] = useState<AdminBrand | null>(null)
  const [open, setOpen] = useState(false)

  const { debouncedSearch } = useCatalogSearch()
  const query = useQuery({
    ...orpc.admin.catalog.listBrands.queryOptions({
      input: { search: debouncedSearch || undefined },
    }),
    placeholderData: keepPreviousData,
  })
  const { emptyMessage } = useCatalogListQuery(query.data, query.isPending)

  const invalidate = () => invalidateCatalogProductQueries(queryClient)

  const createMutation = useMutation(
    orpc.admin.catalog.createBrand.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('برند ایجاد شد.')
        closeForm()
      },
      onError: () => toast.error('ایجاد برند انجام نشد.'),
    }),
  )
  const updateMutation = useMutation(
    orpc.admin.catalog.updateBrand.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('برند ذخیره شد.')
        closeForm()
      },
      onError: () => toast.error('ذخیره برند انجام نشد.'),
    }),
  )
  const deleteMutation = useMutation(
    orpc.admin.catalog.deleteBrand.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('برند حذف شد.')
        setDeleting(null)
      },
      onError: () => toast.error('حذف برند انجام نشد.'),
    }),
  )

  function closeForm() {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSectionActions
        createLabel="برند جدید"
        onCreate={() => {
          setEditing(null)
          setOpen(true)
        }}
      />
      <BrandsTable
        items={query.data ?? []}
        isLoading={query.isPending}
        emptyMessage={emptyMessage}
        onEdit={(item) => {
          setEditing(item)
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش برند' : 'برند جدید'}
        description="برندها به محصولات وصل می‌شوند و در فیلتر فروشگاه قابل استفاده‌اند."
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
      >
        <BrandForm
          key={editing?.id ?? 'create-brand'}
          defaultValues={editing ? brandToForm(editing) : emptyBrandForm}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={closeForm}
          onSubmit={data =>
            editing
              ? updateMutation.mutateAsync({ id: editing.id, data })
              : createMutation.mutateAsync(data)}
        />
      </EntityFormDialog>
      <DeleteCatalogDialog
        open={Boolean(deleting)}
        title="حذف برند"
        description="با حذف برند، اتصال آن از محصولات مرتبط برداشته می‌شود."
        isDeleting={deleteMutation.isPending}
        onOpenChange={open => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id })}
      />
    </div>
  )
}

export function CategoriesSection() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)
  const [open, setOpen] = useState(false)

  const { debouncedSearch } = useCatalogSearch()
  const query = useQuery({
    ...orpc.admin.catalog.listCategories.queryOptions({
      input: { search: debouncedSearch || undefined },
    }),
    placeholderData: keepPreviousData,
  })
  const allCategoriesQuery = useQuery(
    orpc.admin.catalog.listCategories.queryOptions({ input: {} }),
  )
  const categories = query.data ?? []
  const { emptyMessage } = useCatalogListQuery(categories, query.isPending)
  const parentById = useMemo(
    () => new Map((allCategoriesQuery.data ?? []).map(category => [category.id, category])),
    [allCategoriesQuery.data],
  )
  const parentOptions = useMemo(
    () => (allCategoriesQuery.data ?? []).filter(
      category => category.id !== editing?.id,
    ),
    [allCategoriesQuery.data, editing?.id],
  )

  const invalidate = () => invalidateCatalogProductQueries(queryClient)
  const createMutation = useMutation(
    orpc.admin.catalog.createCategory.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('دسته‌بندی ایجاد شد.')
        closeForm()
      },
      onError: () => toast.error('ایجاد دسته‌بندی انجام نشد.'),
    }),
  )
  const updateMutation = useMutation(
    orpc.admin.catalog.updateCategory.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('دسته‌بندی ذخیره شد.')
        closeForm()
      },
      onError: () => toast.error('ذخیره دسته‌بندی انجام نشد.'),
    }),
  )
  const deleteMutation = useMutation(
    orpc.admin.catalog.deleteCategory.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('دسته‌بندی حذف شد.')
        setDeleting(null)
      },
      onError: () => toast.error('حذف دسته‌بندی انجام نشد.'),
    }),
  )

  function closeForm() {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSectionActions
        createLabel="دسته‌بندی جدید"
        onCreate={() => {
          setEditing(null)
          setOpen(true)
        }}
      />
      <CategoriesTable
        items={categories}
        parentById={parentById}
        isLoading={query.isPending}
        emptyMessage={emptyMessage}
        onEdit={(item) => {
          setEditing(item)
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
        description="برای ساخت زیرمجموعه، دسته والد را انتخاب کنید."
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
      >
        <CategoryForm
          key={editing?.id ?? 'create-category'}
          defaultValues={editing ? categoryToForm(editing) : emptyCategoryForm}
          parentOptions={parentOptions}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={closeForm}
          onSubmit={data =>
            editing
              ? updateMutation.mutateAsync({ id: editing.id, data })
              : createMutation.mutateAsync(data)}
        />
      </EntityFormDialog>
      <DeleteCatalogDialog
        open={Boolean(deleting)}
        title="حذف دسته‌بندی"
        description="محصولات از این دسته جدا می‌شوند و زیرمجموعه‌های وابسته طبق قوانین دیتابیس به‌روزرسانی می‌شوند."
        isDeleting={deleteMutation.isPending}
        onOpenChange={open => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id })}
      />
    </div>
  )
}

export function AttributesSection() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<AdminAttribute | null>(null)
  const [deleting, setDeleting] = useState<AdminAttribute | null>(null)
  const [open, setOpen] = useState(false)

  const { debouncedSearch } = useCatalogSearch()
  const query = useQuery({
    ...orpc.admin.catalog.listAttributes.queryOptions({
      input: { search: debouncedSearch || undefined },
    }),
    placeholderData: keepPreviousData,
  })
  const { emptyMessage } = useCatalogListQuery(query.data, query.isPending)
  const invalidate = () => invalidateCatalogProductQueries(queryClient)
  const createMutation = useMutation(
    orpc.admin.catalog.createAttribute.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('ویژگی ایجاد شد.')
        closeForm()
      },
      onError: () => toast.error('ایجاد ویژگی انجام نشد.'),
    }),
  )
  const updateMutation = useMutation(
    orpc.admin.catalog.updateAttribute.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('ویژگی ذخیره شد.')
        closeForm()
      },
      onError: () => toast.error('ذخیره ویژگی انجام نشد.'),
    }),
  )
  const deleteMutation = useMutation(
    orpc.admin.catalog.deleteAttribute.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('ویژگی حذف شد.')
        setDeleting(null)
      },
      onError: () => toast.error('حذف ویژگی انجام نشد.'),
    }),
  )

  function closeForm() {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSectionActions
        createLabel="ویژگی جدید"
        onCreate={() => {
          setEditing(null)
          setOpen(true)
        }}
      />
      <AttributesTable
        items={query.data ?? []}
        isLoading={query.isPending}
        emptyMessage={emptyMessage}
        onEdit={(item) => {
          setEditing(item)
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش ویژگی' : 'ویژگی جدید'}
        description="ویژگی‌ها پایه فیلترها و ترکیب تنوع‌های محصول هستند."
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
      >
        <AttributeForm
          key={editing?.id ?? 'create-attribute'}
          mode={editing ? 'edit' : 'create'}
          defaultValues={editing ? attributeToForm(editing) : emptyAttributeForm}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={closeForm}
          onSubmit={data =>
            editing
              ? updateMutation.mutateAsync({ id: editing.id, data })
              : createMutation.mutateAsync(data)}
        />
      </EntityFormDialog>
      <DeleteCatalogDialog
        open={Boolean(deleting)}
        title="حذف ویژگی"
        description="این ویژگی و مقادیر آن از فیلترها و مشخصات محصول حذف می‌شود."
        isDeleting={deleteMutation.isPending}
        onOpenChange={open => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id })}
      />
    </div>
  )
}

export function CollectionsSection() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<AdminCollection | null>(null)
  const [managingProducts, setManagingProducts] = useState<AdminCollection | null>(null)
  const [deleting, setDeleting] = useState<AdminCollection | null>(null)
  const [open, setOpen] = useState(false)

  const { debouncedSearch } = useCatalogSearch()
  const query = useQuery({
    ...orpc.admin.catalog.listCollections.queryOptions({
      input: { search: debouncedSearch || undefined },
    }),
    placeholderData: keepPreviousData,
  })
  const { emptyMessage } = useCatalogListQuery(query.data, query.isPending)
  const invalidate = () => invalidateCatalogProductQueries(queryClient)
  const createMutation = useMutation(
    orpc.admin.catalog.createCollection.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('کالکشن ایجاد شد.')
        closeForm()
      },
      onError: () => toast.error('ایجاد کالکشن انجام نشد.'),
    }),
  )
  const updateMutation = useMutation(
    orpc.admin.catalog.updateCollection.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('کالکشن ذخیره شد.')
        closeForm()
      },
      onError: () => toast.error('ذخیره کالکشن انجام نشد.'),
    }),
  )
  const deleteMutation = useMutation(
    orpc.admin.catalog.deleteCollection.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('کالکشن حذف شد.')
        setDeleting(null)
      },
      onError: () => toast.error('حذف کالکشن انجام نشد.'),
    }),
  )

  function closeForm() {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSectionActions
        createLabel="کالکشن جدید"
        onCreate={() => {
          setEditing(null)
          setOpen(true)
        }}
      />
      <CollectionsTable
        items={query.data ?? []}
        isLoading={query.isPending}
        emptyMessage={emptyMessage}
        onEdit={(item) => {
          setEditing(item)
          setOpen(true)
        }}
        onManageProducts={setManagingProducts}
        onDelete={setDeleting}
      />
      {managingProducts?.type === 'manual' && (
        <CollectionProductsPanel
          collectionId={managingProducts.id}
          collectionName={managingProducts.name}
          collectionType={managingProducts.type}
        />
      )}
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش کالکشن' : 'کالکشن جدید'}
        description="کالکشن‌ها برای صفحات کمپین، فصل، پیشنهاد ویژه و گروه‌بندی دستی محصولات هستند."
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
      >
        <CollectionForm
          key={editing?.id ?? 'create-collection'}
          defaultValues={editing ? collectionToForm(editing) : emptyCollectionForm}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={closeForm}
          onSubmit={data =>
            editing
              ? updateMutation.mutateAsync({ id: editing.id, data })
              : createMutation.mutateAsync(data)}
        />
      </EntityFormDialog>
      <DeleteCatalogDialog
        open={Boolean(deleting)}
        title="حذف کالکشن"
        description="با حذف کالکشن، فقط خود کالکشن و اتصال محصولات به آن حذف می‌شود."
        isDeleting={deleteMutation.isPending}
        onOpenChange={open => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id })}
      />
    </div>
  )
}

export function TagsSection() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<AdminTag | null>(null)
  const [deleting, setDeleting] = useState<AdminTag | null>(null)
  const [open, setOpen] = useState(false)

  const { debouncedSearch } = useCatalogSearch()
  const query = useQuery({
    ...orpc.admin.catalog.listTags.queryOptions({
      input: { search: debouncedSearch || undefined },
    }),
    placeholderData: keepPreviousData,
  })
  const { emptyMessage } = useCatalogListQuery(query.data, query.isPending)
  const invalidate = () => invalidateCatalogProductQueries(queryClient)
  const createMutation = useMutation(
    orpc.admin.catalog.createTag.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('تگ ایجاد شد.')
        closeForm()
      },
      onError: () => toast.error('ایجاد تگ انجام نشد.'),
    }),
  )
  const updateMutation = useMutation(
    orpc.admin.catalog.updateTag.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('تگ ذخیره شد.')
        closeForm()
      },
      onError: () => toast.error('ذخیره تگ انجام نشد.'),
    }),
  )
  const deleteMutation = useMutation(
    orpc.admin.catalog.deleteTag.mutationOptions({
      onSuccess: async () => {
        await invalidate()
        toast.success('تگ حذف شد.')
        setDeleting(null)
      },
      onError: () => toast.error('حذف تگ انجام نشد.'),
    }),
  )

  function closeForm() {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSectionActions
        createLabel="تگ جدید"
        onCreate={() => {
          setEditing(null)
          setOpen(true)
        }}
      />
      <TagsTable
        items={query.data ?? []}
        isLoading={query.isPending}
        emptyMessage={emptyMessage}
        onEdit={(item) => {
          setEditing(item)
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش تگ' : 'تگ جدید'}
        description="از لیبل برای Featured، New، Discounted و نشان‌های محصول استفاده کنید."
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
      >
        <TagForm
          key={editing?.id ?? 'create-tag'}
          defaultValues={editing ? tagToForm(editing) : emptyTagForm}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={closeForm}
          onSubmit={data =>
            editing
              ? updateMutation.mutateAsync({ id: editing.id, data })
              : createMutation.mutateAsync(data)}
        />
      </EntityFormDialog>
      <DeleteCatalogDialog
        open={Boolean(deleting)}
        title="حذف تگ"
        description="با حذف تگ، نشان و اتصال آن از محصولات مرتبط حذف می‌شود."
        isDeleting={deleteMutation.isPending}
        onOpenChange={open => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id })}
      />
    </div>
  )
}

function EntityFormDialog({
  open,
  title,
  description,
  onOpenChange,
  children,
}: {
  open: boolean
  title: string
  description: string
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
