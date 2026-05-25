import type { AnyFieldApi } from '@tanstack/react-form'
import type { LucideIcon } from 'lucide-react'
import type {
  AdminProductDetail,
  AdminProductMeta,
} from '#/orpc/schemas/admin/products'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowRight,
  Braces,
  CheckCircle2,
  ImagePlus,
  PackageCheck,
  RotateCcw,
  Save,
  WandSparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { Badge } from '#/components/ui/badge'
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
import {
  ProductAttributesField,
  ProductCategoriesField,
  ProductCollectionsField,
  ProductTagsField,
} from '#/features/admin/products/product-catalog-fields'
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
    categoryIds: product?.categoryIds ?? [],
    tagIds: product?.tagIds ?? [],
    collectionIds: product?.collectionIds ?? [],
    attributeValues: product?.attributeValues ?? [],
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
    categoryIds: value.categoryIds,
    tagIds: value.tagIds,
    collectionIds: value.collectionIds,
    attributeValues: value.attributeValues,
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

function ProductBrandIdField({
  field,
  brandOptions,
}: {
  field: AnyFieldApi
  brandOptions: Array<{ label: string, value: string }>
}) {
  const showError = useShowFieldError(field)

  return (
    <Field data-invalid={showError}>
      <FieldLabel htmlFor={field.name}>برند ثبت‌شده</FieldLabel>
      <FieldDescription>
        برندهای خود را در
        {' '}
        <Link
          to="/dashboard/admin/catalog/brands"
          className="text-primary underline-offset-4 hover:underline"
        >
          برندها
        </Link>
        {' '}
        مدیریت کنید.
      </FieldDescription>
      <Select
        value={String(field.state.value)}
        onValueChange={field.handleChange}
      >
        <SelectTrigger id={field.name} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {brandOptions.map(option => (
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

function SectionIntro({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm leading-6">
          {description}
        </p>
      )}
    </div>
  )
}

function CreateModeLockedSection({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="flex items-start gap-3 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center border bg-background">
          <Icon className="size-4" />
        </span>
        <div className="space-y-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm leading-6">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductReadinessPanel({
  mode,
  product,
  values,
}: {
  mode: 'create' | 'edit'
  product?: AdminProductDetail
  values: ReturnType<typeof toFormValues>
}) {
  const meta = (() => {
    try {
      return parseMetaJson(values.metaJson)
    }
    catch {
      return { title: '', description: '', keywords: '' }
    }
  })()
  const imageCount = product?.images.length ?? 0
  const variantCount = product?.variants.length ?? 0
  const totalStock = product?.variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0,
  ) ?? 0

  const items = [
    {
      label: 'تصویر',
      ok: imageCount > 0,
      value: imageCount > 0 ? `${imageCount.toLocaleString('fa-IR')} تصویر` : 'ندارد',
    },
    {
      label: 'تنوع و قیمت',
      ok: variantCount > 0,
      value: variantCount > 0 ? `${variantCount.toLocaleString('fa-IR')} SKU` : 'بعد از ذخیره',
    },
    {
      label: 'موجودی',
      ok: totalStock > 0,
      value: totalStock > 0 ? totalStock.toLocaleString('fa-IR') : 'ناموجود',
    },
    {
      label: 'دسته‌بندی',
      ok: values.categoryIds.length > 0,
      value: values.categoryIds.length > 0 ? 'انتخاب شده' : 'انتخاب نشده',
    },
    {
      label: 'سئو',
      ok: Boolean(meta.title && meta.description),
      value: meta.title && meta.description ? 'کامل' : 'ناقص',
    },
  ]

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>آمادگی محصول</CardTitle>
        <CardDescription>
          وضعیت سریع برای انتشار در فروشگاه
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">وضعیت انتشار</span>
          <Badge variant={values.status === 'active' ? 'default' : 'secondary'}>
            {productStatusOptions.find(option => option.value === values.status)?.label}
          </Badge>
        </div>
        {items.map(item => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              {item.ok
                ? <CheckCircle2 className="text-primary size-4" />
                : <AlertCircle className="text-muted-foreground size-4" />}
              {item.label}
            </span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
        ))}
        {mode === 'create' && (
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            تصاویر و تنوع‌ها بعد از اولین ذخیره فعال می‌شوند.
          </p>
        )}
      </CardContent>
    </Card>
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
    input: { activeOnly: true },
  }))
  const categoriesQuery = useQuery(orpc.admin.catalog.listCategories.queryOptions({
    input: { activeOnly: true },
  }))
  const tagsQuery = useQuery(orpc.admin.catalog.listTags.queryOptions({
    input: { activeOnly: true },
  }))
  const collectionsQuery = useQuery(orpc.admin.catalog.listCollections.queryOptions({
    input: { activeOnly: true },
  }))
  const attributesQuery = useQuery(orpc.admin.catalog.listAttributes.queryOptions({
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
    <form
      id={PRODUCT_EDITOR_FORM_ID}
      className="flex w-full flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <AdminPageHeader
        title={mode === 'create' ? 'محصول جدید' : 'ویرایش محصول'}
        description={
          mode === 'create'
            ? 'ابتدا اطلاعات اصلی را ذخیره کنید، سپس تصاویر و تنوع‌ها را کامل کنید.'
            : product?.name
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <SectionIntro
                title="اطلاعات فروش"
                description="نام، آدرس صفحه و توضیحاتی که مشتری در صفحه محصول می‌بیند."
              />
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <form.Field name="name">
                {field => (
                  <ProductTextField
                    field={field}
                    label="نام محصول"
                    className="md:col-span-2"
                  />
                )}
              </form.Field>

              <form.Field name="slug">
                {field => (
                  <ProductTextField
                    field={field}
                    label="اسلاگ (URL)"
                    dir="ltr"
                    inputClassName="text-start"
                    placeholder={slugify(form.state.values.name) || 'product-slug'}
                  />
                )}
              </form.Field>

              <form.Field name="shortDescription">
                {field => (
                  <ProductTextareaField
                    field={field}
                    label="توضیح کوتاه"
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
                    rows={7}
                    className="md:col-span-2"
                  />
                )}
              </form.Field>
            </CardContent>
          </Card>

          {mode === 'edit' && productId && product
            ? (
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
              )
            : (
                <>
                  <CreateModeLockedSection
                    title="تصاویر محصول"
                    description="بعد از ذخیره اولیه محصول، بارگذاری گالری و انتخاب کاور فعال می‌شود."
                    icon={ImagePlus}
                  />
                  <CreateModeLockedSection
                    title="تنوع‌ها، قیمت و موجودی"
                    description="بعد از ایجاد محصول، SKU، قیمت به تومان، موجودی و وضعیت فروش هر تنوع را اضافه کنید."
                    icon={PackageCheck}
                  />
                </>
              )}

          <Card>
            <CardHeader>
              <SectionIntro
                title="مشخصات محصول"
                description="ویژگی‌های کاتالوگ برای فیلتر و نمایش جزئیات محصول."
              />
            </CardHeader>
            <CardContent>
              <form.Field name="attributeValues">
                {field => (
                  <ProductAttributesField
                    field={field}
                    attributes={attributesQuery.data ?? []}
                  />
                )}
              </form.Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionIntro
                title="سئو (SEO)"
                description="متادیتا از JSON زیر خوانده می‌شود و قبل از ذخیره اعتبارسنجی می‌شود."
              />
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
        </main>

        <aside className="min-w-0">
          <div className="sticky top-4 flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col gap-3 py-4">
                <Button type="submit" disabled={isSaving}>
                  <Save />
                  {isSaving
                    ? 'در حال ذخیره...'
                    : mode === 'create' ? 'ایجاد محصول' : 'ذخیره تغییرات'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/dashboard/admin/products">
                    <ArrowRight />
                    بازگشت به محصولات
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <form.Subscribe selector={state => state.values}>
              {values => (
                <ProductReadinessPanel
                  mode={mode}
                  product={product}
                  values={values}
                />
              )}
            </form.Subscribe>

            <Card>
              <CardHeader>
                <CardTitle>انتشار</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form.Field name="status">
                  {field => (
                    <ProductSelectField
                      className="w-full"
                      field={field}
                      label="وضعیت"
                      options={productStatusOptions}
                    />
                  )}
                </form.Field>
                <form.Field name="isActive">
                  {field => (
                    <ProductSwitchField
                      field={field}
                      label="نمایش در فروشگاه"
                    />
                  )}
                </form.Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>سازمان‌دهی</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 flex-col">

                <form.Field name="productType">
                  {field => (
                    <ProductSelectField
                      className="w-full"
                      field={field}
                      label="نوع محصول"
                      options={productTypeOptions}
                    />
                  )}
                </form.Field>

                <form.Field name="brandId">
                  {field => (
                    <ProductBrandIdField

                      field={field}
                      brandOptions={brandOptions}
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

                <form.Field name="tagIds">
                  {field => (
                    <ProductTagsField
                      field={field}
                      options={tagsQuery.data ?? []}
                    />
                  )}
                </form.Field>

                <form.Field name="collectionIds">
                  {field => (
                    <ProductCollectionsField
                      field={field}
                      options={collectionsQuery.data ?? []}
                    />
                  )}
                </form.Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ارسال و نوع فروش</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <form.Field name="requiresShipping">
                  {field => (
                    <ProductSwitchField
                      field={field}
                      label="نیاز به ارسال"
                    />
                  )}
                </form.Field>

                <form.Field name="isDigital">
                  {field => (
                    <ProductSwitchField
                      field={field}
                      label="محصول دیجیتال"
                    />
                  )}
                </form.Field>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </form>
  )
}
