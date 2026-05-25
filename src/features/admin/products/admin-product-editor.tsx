import type { AnyFieldApi } from '@tanstack/react-form'
import type {
  AdminProductDetail,
  AdminProductMeta,
} from '#/orpc/schemas/admin/products'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Braces, RotateCcw, Save, WandSparkles } from 'lucide-react'
import { toast } from 'sonner'

import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { ProductImagesSection } from '#/features/admin/products/product-images-section'
import { ProductVariantsSection } from '#/features/admin/products/product-variants-section'
import { useShowFieldError } from '#/features/settings/components/field-validation'
import { slugify } from '#/lib/slug'
import { cn } from '#/lib/utils'
import { orpc } from '#/orpc/client'
import {
  adminProductFormWithMetaSchema,
  adminProductMetaSchema,
} from '#/orpc/schemas/admin/products'

const PRODUCT_EDITOR_FORM_ID = 'product-editor-form'

const productTypeOptions = [
  { value: 'simple', label: 'ساده' },
  { value: 'variable', label: 'متغیر' },
  { value: 'bundle', label: 'باندل' },
  { value: 'digital', label: 'دیجیتال' },
  { value: 'subscription', label: 'اشتراکی' },
  { value: 'service', label: 'خدمت' },
]

const productStatusOptions = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'active', label: 'فعال' },
  { value: 'archived', label: 'آرشیو شده' },
]

interface AdminProductEditorProps {
  mode: 'create' | 'edit'
  productId?: string
}

function toMetaValue(product?: AdminProductDetail): AdminProductMeta {
  return {
    title: product?.metaTitle ?? '',
    description: product?.metaDescription ?? '',
    keywords: product?.metaKeywords ?? '',
  }
}

function toFormValues(product?: AdminProductDetail) {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    productType: product?.productType ?? 'simple',
    status: product?.status ?? 'active',
    brandId: product?.brandId ?? 'none',
    brand: product?.brand ?? '',
    categoryIds: product?.categoryIds ?? [],
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    metaJson: formatMetaJson(toMetaValue(product)),
    requiresShipping: product?.requiresShipping ?? true,
    isDigital: product?.isDigital ?? false,
    isActive: product?.isActive ?? true,
  }
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function toPayload(value: ReturnType<typeof toFormValues>) {
  const meta = parseMetaJson(value.metaJson)

  return {
    productType: value.productType,
    status: value.status,
    name: value.name,
    slug: optionalText(value.slug),
    brandId: value.brandId === 'none' ? '' : value.brandId,
    brand: optionalText(value.brand),
    categoryIds: value.categoryIds,
    shortDescription: optionalText(value.shortDescription),
    description: optionalText(value.description),
    metaTitle: optionalText(meta.title),
    metaDescription: optionalText(meta.description),
    metaKeywords: optionalText(meta.keywords),
    requiresShipping: value.requiresShipping,
    isDigital: value.isDigital,
    isActive: value.isActive,
  }
}

function formatMetaJson(value: AdminProductMeta) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function parseMetaJson(json: string): AdminProductMeta {
  return adminProductMetaSchema.parse(JSON.parse(json))
}

export function AdminProductEditor({ mode, productId }: AdminProductEditorProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const productQuery = useQuery({
    ...orpc.admin.products.get.queryOptions({ input: { id: productId! } }),
    enabled: mode === 'edit' && Boolean(productId),
  })

  const createMutation = useMutation(
    orpc.admin.products.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: orpc.admin.products.list.key(),
        })
        toast.success('محصول ایجاد شد. اکنون تصاویر و تنوع‌ها را اضافه کنید.')
        void navigate({
          to: '/dashboard/admin/products/$productId/edit',
          params: { productId: data.id },
        })
      },
      onError: () => toast.error('ایجاد محصول انجام نشد.'),
    }),
  )

  const updateMutation = useMutation(
    orpc.admin.products.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.admin.products.list.key(),
        })
        if (productId) {
          await queryClient.invalidateQueries({
            queryKey: orpc.admin.products.get.key({ input: { id: productId } }),
          })
        }
        toast.success('محصول ذخیره شد.')
      },
      onError: () => toast.error('ذخیره محصول انجام نشد.'),
    }),
  )

  if (mode === 'edit') {
    if (productQuery.isPending) {
      return <Skeleton className="h-96 w-full" />
    }

    if (productQuery.isError || !productQuery.data) {
      return <p className="text-destructive text-sm">محصول یافت نشد.</p>
    }

    return (
      <ProductEditorForm
        key={productQuery.data.updatedAt}
        mode="edit"
        productId={productId!}
        product={productQuery.data}
        isSaving={updateMutation.isPending}
        onSave={values =>
          updateMutation.mutateAsync({
            id: productId!,
            data: toPayload(values),
          })}
        onRefetch={() => productQuery.refetch()}
      />
    )
  }

  return (
    <ProductEditorForm
      mode="create"
      isSaving={createMutation.isPending}
      onSave={values => createMutation.mutateAsync(toPayload(values))}
    />
  )
}

interface ProductFieldProps {
  field: AnyFieldApi
  label: string
  description?: string
  className?: string
}

function ProductTextField({
  field,
  label,
  description,
  className,
  inputClassName,
  placeholder,
  dir,
}: ProductFieldProps & {
  inputClassName?: string
  placeholder?: string
  dir?: React.HTMLAttributes<HTMLInputElement>['dir']
}) {
  const showError = useShowFieldError(field)

  return (
    <Field data-invalid={showError} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Input
        id={field.name}
        name={field.name}
        dir={dir}
        className={inputClassName}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={event => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={showError}
      />
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

function ProductTextareaField({
  field,
  label,
  description,
  className,
  textareaClassName,
  rows,
  dir,
}: ProductFieldProps & {
  textareaClassName?: string
  rows?: number
  dir?: React.HTMLAttributes<HTMLTextAreaElement>['dir']
}) {
  const showError = useShowFieldError(field)

  return (
    <Field data-invalid={showError} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Textarea
        id={field.name}
        name={field.name}
        dir={dir}
        rows={rows}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={event => field.handleChange(event.target.value)}
        className={textareaClassName}
        aria-invalid={showError}
      />
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

function ProductSwitchField({
  field,
  label,
  description,
  className,
}: ProductFieldProps) {
  const showError = useShowFieldError(field)

  return (
    <Field
      data-invalid={showError}
      orientation="horizontal"
      className={cn('items-center justify-between border bg-muted/20 p-4', className)}
    >
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        {showError && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
      <Switch
        id={field.name}
        checked={Boolean(field.state.value)}
        onCheckedChange={field.handleChange}
        aria-invalid={showError}
      />
    </Field>
  )
}

function ProductSelectField({
  field,
  label,
  description,
  options,
  className,
}: ProductFieldProps & {
  options: Array<{ label: string, value: string }>
}) {
  const showError = useShowFieldError(field)

  return (
    <Field data-invalid={showError} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Select
        value={String(field.state.value)}
        onValueChange={field.handleChange}
      >
        <SelectTrigger id={field.name} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

function ProductCategoriesField({
  field,
  options,
}: {
  field: AnyFieldApi
  options: Array<{ id: string, name: string, parentId: string | null }>
}) {
  const selectedIds = new Set<string>(field.state.value)
  const showError = useShowFieldError(field)

  function toggleCategory(categoryId: string) {
    const nextIds = selectedIds.has(categoryId)
      ? field.state.value.filter((id: string) => id !== categoryId)
      : [...field.state.value, categoryId]

    field.handleChange(nextIds)
  }

  return (
    <Field data-invalid={showError} className="md:col-span-2">
      <FieldLabel>دسته‌بندی‌ها</FieldLabel>
      <FieldDescription>
        محصول می‌تواند در چند دسته و زیرمجموعه هم‌زمان قرار بگیرد.
      </FieldDescription>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.length === 0
          ? (
              <div className="text-muted-foreground border p-3 text-sm">
                ابتدا از بخش کاتالوگ دسته‌بندی بسازید.
              </div>
            )
          : options.map(category => (
              <button
                key={category.id}
                type="button"
                data-selected={selectedIds.has(category.id)}
                className="flex min-h-11 items-center justify-between gap-2 border bg-background px-3 py-2 text-start text-sm transition-colors hover:bg-muted/50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                onClick={() => toggleCategory(category.id)}
              >
                <span>{category.name}</span>
                {selectedIds.has(category.id) && (
                  <span className="text-primary text-xs font-medium">
                    انتخاب شده
                  </span>
                )}
              </button>
            ))}
      </div>
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

function ProductMetaJsonField({
  field,
  initialValue,
}: {
  field: AnyFieldApi
  initialValue: string
}) {
  const showError = useShowFieldError(field)

  function handleFormat() {
    try {
      const meta = parseMetaJson(field.state.value)
      field.handleChange(formatMetaJson(meta))
    }
    catch {
      field.handleBlur()
      toast.error('JSON متادیتا معتبر نیست.')
    }
  }

  return (
    <Field data-invalid={showError}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Braces className="size-4" />
          Metadata JSON
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleFormat}>
            <Braces />
            فرمت JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              field.handleChange(formatMetaJson({
                title: 'خرید Nike Air Max 90',
                description: 'خرید کتانی Nike Air Max 90 با تصاویر محصول، سایزبندی و موجودی به‌روز.',
                keywords: 'nike, air max, sneaker',
              }))
            }}
          >
            <WandSparkles />
            نمونه
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => field.handleChange(initialValue)}
          >
            <RotateCcw />
            بازنشانی
          </Button>
        </div>
      </div>

      <FieldLabel htmlFor={field.name}>متادیتا</FieldLabel>
      <FieldDescription>
        کلیدهای مجاز: title، description، keywords
      </FieldDescription>
      <Textarea
        id={field.name}
        name={field.name}
        dir="ltr"
        spellCheck={false}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={event => field.handleChange(event.target.value)}
        className="min-h-48 resize-y rounded-none  text-sm leading-6 text-left"
        aria-invalid={showError}
      />
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

interface ProductEditorFormProps {
  mode: 'create' | 'edit'
  productId?: string
  product?: AdminProductDetail
  isSaving: boolean
  onSave: (values: ReturnType<typeof toFormValues>) => Promise<unknown>
  onRefetch?: () => void
}

function ProductEditorForm({
  mode,
  productId,
  product,
  isSaving,
  onSave,
  onRefetch,
}: ProductEditorFormProps) {
  const initialMetaJson = formatMetaJson(toMetaValue(product))
  const brandsQuery = useQuery(orpc.admin.catalog.listBrands.queryOptions({
    input: {},
  }))
  const categoriesQuery = useQuery(orpc.admin.catalog.listCategories.queryOptions({
    input: {},
  }))

  const brandOptions = [
    { value: 'none', label: 'بدون برند' },
    ...(brandsQuery.data ?? []).map(brand => ({
      value: brand.id,
      label: brand.name,
    })),
  ]

  const form = useForm({
    defaultValues: toFormValues(product),
    validators: {
      onSubmit: adminProductFormWithMetaSchema,
    },
    onSubmit: async ({ value }) => {
      await onSave(value)
    },
  })

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <AdminPageHeader
          title={mode === 'create' ? 'محصول جدید' : 'ویرایش محصول'}
          description={
            mode === 'create'
              ? 'اطلاعات اصلی محصول را کامل کنید و ذخیره کنید.'
              : product?.name
          }
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/admin/products">
              <ArrowRight />
              بازگشت به لیست محصولات
            </Link>
          </Button>
          <Button
            type="submit"
            form={PRODUCT_EDITOR_FORM_ID}
            disabled={isSaving}
          >
            <Save />
            {isSaving
              ? 'در حال ذخیره...'
              : mode === 'create' ? 'ایجاد محصول' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </div>
      <form
        id={PRODUCT_EDITOR_FORM_ID}
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <form.Field name="name">
              {field => (
                <ProductTextField
                  field={field}
                  label="نام محصول"
                  description="نامی که در لیست و صفحه محصول نمایش داده می‌شود."
                  className="md:col-span-2"
                />
              )}
            </form.Field>

            <form.Field name="slug">
              {field => (
                <ProductTextField
                  field={field}
                  label="اسلاگ (URL)"
                  description="اگر خالی بماند، از نام محصول ساخته می‌شود."
                  dir="ltr"
                  inputClassName=" text-start"
                  placeholder={slugify(form.state.values.name) || 'product-slug'}
                />
              )}
            </form.Field>

            <form.Field name="productType">
              {field => (
                <ProductSelectField
                  field={field}
                  label="نوع محصول"
                  description="برای کالاهای ساده، متغیر، دیجیتال، باندل، اشتراک و خدمات."
                  options={productTypeOptions}
                />
              )}
            </form.Field>

            <form.Field name="status">
              {field => (
                <ProductSelectField
                  field={field}
                  label="وضعیت انتشار"
                  description="برای آماده‌سازی، انتشار یا آرشیو محصول."
                  options={productStatusOptions}
                />
              )}
            </form.Field>

            <form.Field name="brandId">
              {field => (
                <ProductSelectField
                  field={field}
                  label="برند ثبت‌شده"
                  description="برندهای حرفه‌ای را از بخش کاتالوگ مدیریت کنید."
                  options={brandOptions}
                />
              )}
            </form.Field>

            <form.Field name="brand">
              {field => (
                <ProductTextField
                  field={field}
                  label="نام برند نمایشی"
                  description="برای سازگاری با محصولات قدیمی یا برند آزاد."
                />
              )}
            </form.Field>

            <form.Field name="categoryIds">
              {field => (
                <ProductCategoriesField
                  field={field}
                  options={categoriesQuery.data ?? []}
                />
              )}
            </form.Field>

            <form.Field name="shortDescription">
              {field => (
                <ProductTextareaField
                  field={field}
                  label="توضیح کوتاه (لیست محصولات)"
                  description="متن کوتاه برای کارت محصول و خلاصه صفحه."
                  rows={3}
                  className="md:col-span-2"
                />
              )}
            </form.Field>

            <form.Field name="description">
              {field => (
                <ProductTextareaField
                  field={field}
                  label="توضیحات کامل"
                  description="توضیح کامل شامل ویژگی‌ها، کاربرد و جزئیات مهم محصول."
                  rows={7}
                  className="md:col-span-2"
                />
              )}
            </form.Field>

            <form.Field name="isActive">
              {field => (
                <ProductSwitchField
                  field={field}
                  label="نمایش در فروشگاه"
                  description="محصول غیرفعال در فروشگاه نمایش داده نمی‌شود."
                  className="md:col-span-2"
                />
              )}
            </form.Field>

            <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
              <form.Field name="requiresShipping">
                {field => (
                  <ProductSwitchField
                    field={field}
                    label="نیاز به ارسال"
                    description="برای محصولات فیزیکی، وزن و قوانین ارسال اعمال می‌شود."
                  />
                )}
              </form.Field>

              <form.Field name="isDigital">
                {field => (
                  <ProductSwitchField
                    field={field}
                    label="محصول دیجیتال"
                    description="برای فایل دانلودی، سرویس یا محصول بدون ارسال فیزیکی."
                  />
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سئو (SEO)</CardTitle>
            <CardDescription>
              متادیتا فقط از این JSON خوانده می‌شود و قبل از ذخیره اعتبارسنجی می‌شود.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form.Field name="metaJson">
              {field => (
                <ProductMetaJsonField
                  field={field}
                  initialValue={initialMetaJson}
                />
              )}
            </form.Field>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/admin/products">
              <ArrowRight />
              بازگشت به لیست محصولات
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save />
            {isSaving
              ? 'در حال ذخیره...'
              : mode === 'create' ? 'ایجاد محصول' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </form>

      {mode === 'edit' && productId && product && (
        <>
          <ProductImagesSection
            productId={productId}
            images={product.images}
          />
          <ProductVariantsSection
            key={`${product.updatedAt}-${product.variants.length}`}
            productId={productId}
            variants={product.variants}
            onSaved={() => onRefetch?.()}
          />
        </>
      )}
    </div>
  )
}
