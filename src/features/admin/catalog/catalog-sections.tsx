import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'
import type {
  AttributeFormValue,
  BrandFormValue,
  CategoryFormValue,
  CollectionFormValue,
  TagFormValue,
} from './catalog-types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { slugify } from '#/lib/slug'
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
  CatalogPanel,
  DeleteCatalogDialog,
} from './catalog-shared'
import {
  AttributesTable,
  BrandsTable,
  CategoriesTable,
  CollectionsTable,
  TagsTable,
} from './catalog-tables'

interface SectionProps {
  search: string
}

function optionalText(value: string) {
  const trimmed = value.trim()
  return trimmed || undefined
}

function attributeValuesFromText(valuesText: string) {
  return valuesText
    .split('\n')
    .map(value => value.trim())
    .filter(Boolean)
    .map((value, index) => ({
      value,
      slug: slugify(value),
      sortOrder: index,
    }))
}

export function BrandsSection({ search }: SectionProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BrandFormValue>(emptyBrandForm)
  const [editing, setEditing] = useState<AdminBrand | null>(null)
  const [deleting, setDeleting] = useState<AdminBrand | null>(null)
  const [open, setOpen] = useState(false)

  const query = useQuery(orpc.admin.catalog.listBrands.queryOptions({
    input: { search: search || undefined },
  }))

  const invalidate = () => queryClient.invalidateQueries({
    queryKey: orpc.admin.catalog.listBrands.key(),
  })

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
    setForm(emptyBrandForm)
  }

  function handleSubmit() {
    const data = {
      name: form.name,
      slug: form.slug,
      description: optionalText(form.description),
      websiteUrl: optionalText(form.websiteUrl),
      isActive: form.isActive,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
      return
    }

    createMutation.mutate(data)
  }

  return (
    <CatalogPanel
      title="برندها"
      createLabel="برند جدید"
      onCreate={() => {
        setEditing(null)
        setForm(emptyBrandForm)
        setOpen(true)
      }}
    >
      <BrandsTable
        items={query.data ?? []}
        isLoading={query.isPending}
        onEdit={(item) => {
          setEditing(item)
          setForm(brandToForm(item))
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش برند' : 'برند جدید'}
        description="برندها به محصولات وصل می‌شوند و در فیلتر فروشگاه قابل استفاده‌اند."
        isSaving={createMutation.isPending || updateMutation.isPending}
        canSubmit={Boolean(form.name && form.slug)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
        onSubmit={handleSubmit}
      >
        <BrandForm
          value={form}
          onChange={next => setForm({
            ...next,
            slug: form.slug || slugify(next.name),
          })}
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
    </CatalogPanel>
  )
}

export function CategoriesSection({ search }: SectionProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CategoryFormValue>(emptyCategoryForm)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)
  const [open, setOpen] = useState(false)

  const query = useQuery(orpc.admin.catalog.listCategories.queryOptions({
    input: { search: search || undefined },
  }))
  const categories = query.data ?? []
  const parentOptions = useMemo(
    () => categories.filter(category => category.id !== editing?.id),
    [categories, editing?.id],
  )

  const invalidate = () => queryClient.invalidateQueries({
    queryKey: orpc.admin.catalog.listCategories.key(),
  })
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
    setForm(emptyCategoryForm)
  }

  function handleSubmit() {
    const data = {
      name: form.name,
      slug: form.slug,
      parentId: form.parentId === 'none' ? null : form.parentId,
      description: optionalText(form.description),
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
      return
    }

    createMutation.mutate(data)
  }

  return (
    <CatalogPanel
      title="دسته‌بندی‌ها"
      createLabel="دسته‌بندی جدید"
      onCreate={() => {
        setEditing(null)
        setForm(emptyCategoryForm)
        setOpen(true)
      }}
    >
      <CategoriesTable
        items={categories}
        isLoading={query.isPending}
        onEdit={(item) => {
          setEditing(item)
          setForm(categoryToForm(item))
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
        description="برای ساخت زیرمجموعه، دسته والد را انتخاب کنید."
        isSaving={createMutation.isPending || updateMutation.isPending}
        canSubmit={Boolean(form.name && form.slug)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
        onSubmit={handleSubmit}
      >
        <CategoryForm
          value={form}
          parentOptions={parentOptions}
          onChange={next => setForm({
            ...next,
            slug: form.slug || slugify(next.name),
          })}
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
    </CatalogPanel>
  )
}

export function AttributesSection({ search }: SectionProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AttributeFormValue>(emptyAttributeForm)
  const [editing, setEditing] = useState<AdminAttribute | null>(null)
  const [deleting, setDeleting] = useState<AdminAttribute | null>(null)
  const [open, setOpen] = useState(false)

  const query = useQuery(orpc.admin.catalog.listAttributes.queryOptions({
    input: { search: search || undefined },
  }))
  const invalidate = () => queryClient.invalidateQueries({
    queryKey: orpc.admin.catalog.listAttributes.key(),
  })
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
    setForm(emptyAttributeForm)
  }

  function handleSubmit() {
    const data = {
      name: form.name,
      code: form.code,
      type: form.type,
      scope: form.scope,
      unit: optionalText(form.unit),
      isFilterable: form.isFilterable,
      isVariantOption: form.isVariantOption,
      isRequired: form.isRequired,
      values: attributeValuesFromText(form.valuesText),
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
      return
    }

    createMutation.mutate(data)
  }

  return (
    <CatalogPanel
      title="ویژگی‌ها"
      createLabel="ویژگی جدید"
      onCreate={() => {
        setEditing(null)
        setForm(emptyAttributeForm)
        setOpen(true)
      }}
    >
      <AttributesTable
        items={query.data ?? []}
        isLoading={query.isPending}
        onEdit={(item) => {
          setEditing(item)
          setForm(attributeToForm(item))
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش ویژگی' : 'ویژگی جدید'}
        description="ویژگی‌ها پایه فیلترها و ترکیب تنوع‌های محصول هستند."
        isSaving={createMutation.isPending || updateMutation.isPending}
        canSubmit={Boolean(form.name && form.code)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
        onSubmit={handleSubmit}
      >
        <AttributeForm
          value={form}
          onChange={next => setForm({
            ...next,
            code: form.code || slugify(next.name).replaceAll('-', '_'),
          })}
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
    </CatalogPanel>
  )
}

export function CollectionsSection({ search }: SectionProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CollectionFormValue>(emptyCollectionForm)
  const [editing, setEditing] = useState<AdminCollection | null>(null)
  const [deleting, setDeleting] = useState<AdminCollection | null>(null)
  const [open, setOpen] = useState(false)

  const query = useQuery(orpc.admin.catalog.listCollections.queryOptions({
    input: { search: search || undefined },
  }))
  const invalidate = () => queryClient.invalidateQueries({
    queryKey: orpc.admin.catalog.listCollections.key(),
  })
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
    setForm(emptyCollectionForm)
  }

  function handleSubmit() {
    const data = {
      name: form.name,
      slug: form.slug,
      type: form.type,
      description: optionalText(form.description),
      isActive: form.isActive,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
      return
    }

    createMutation.mutate(data)
  }

  return (
    <CatalogPanel
      title="کالکشن‌ها"
      createLabel="کالکشن جدید"
      onCreate={() => {
        setEditing(null)
        setForm(emptyCollectionForm)
        setOpen(true)
      }}
    >
      <CollectionsTable
        items={query.data ?? []}
        isLoading={query.isPending}
        onEdit={(item) => {
          setEditing(item)
          setForm(collectionToForm(item))
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش کالکشن' : 'کالکشن جدید'}
        description="کالکشن‌ها برای صفحات کمپین، فصل، پیشنهاد ویژه و گروه‌بندی دستی محصولات هستند."
        isSaving={createMutation.isPending || updateMutation.isPending}
        canSubmit={Boolean(form.name && form.slug)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
        onSubmit={handleSubmit}
      >
        <CollectionForm
          value={form}
          onChange={next => setForm({
            ...next,
            slug: form.slug || slugify(next.name),
          })}
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
    </CatalogPanel>
  )
}

export function TagsSection({ search }: SectionProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<TagFormValue>(emptyTagForm)
  const [editing, setEditing] = useState<AdminTag | null>(null)
  const [deleting, setDeleting] = useState<AdminTag | null>(null)
  const [open, setOpen] = useState(false)

  const query = useQuery(orpc.admin.catalog.listTags.queryOptions({
    input: { search: search || undefined },
  }))
  const invalidate = () => queryClient.invalidateQueries({
    queryKey: orpc.admin.catalog.listTags.key(),
  })
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
    setForm(emptyTagForm)
  }

  function handleSubmit() {
    const data = {
      name: form.name,
      slug: form.slug,
      type: form.type,
      color: optionalText(form.color),
      isActive: form.isActive,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
      return
    }

    createMutation.mutate(data)
  }

  return (
    <CatalogPanel
      title="تگ‌ها و لیبل‌ها"
      createLabel="تگ جدید"
      onCreate={() => {
        setEditing(null)
        setForm(emptyTagForm)
        setOpen(true)
      }}
    >
      <TagsTable
        items={query.data ?? []}
        isLoading={query.isPending}
        onEdit={(item) => {
          setEditing(item)
          setForm(tagToForm(item))
          setOpen(true)
        }}
        onDelete={setDeleting}
      />
      <EntityFormDialog
        open={open}
        title={editing ? 'ویرایش تگ' : 'تگ جدید'}
        description="از لیبل برای Featured، New، Discounted و نشان‌های محصول استفاده کنید."
        isSaving={createMutation.isPending || updateMutation.isPending}
        canSubmit={Boolean(form.name && form.slug)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeForm()
            return
          }
          setOpen(true)
        }}
        onSubmit={handleSubmit}
      >
        <TagForm
          value={form}
          onChange={next => setForm({
            ...next,
            slug: form.slug || slugify(next.name),
          })}
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
    </CatalogPanel>
  )
}

function EntityFormDialog({
  open,
  title,
  description,
  canSubmit,
  isSaving,
  onOpenChange,
  onSubmit,
  children,
}: {
  open: boolean
  title: string
  description: string
  canSubmit: boolean
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
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
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button
            type="button"
            disabled={isSaving || !canSubmit}
            onClick={onSubmit}
          >
            ذخیره
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
