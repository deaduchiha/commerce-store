import type { AdminProductDetail } from '#/orpc/schemas/admin/products'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Skeleton } from '#/components/ui/skeleton'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { ProductImagesSection } from '#/features/admin/products/product-images-section'
import { ProductVariantsSection } from '#/features/admin/products/product-variants-section'
import { slugify } from '#/lib/slug'
import { orpc } from '#/orpc/client'
import { adminProductFormSchema } from '#/orpc/schemas/admin/products'

interface AdminProductEditorProps {
  mode: 'create' | 'edit'
  productId?: string
}

function toFormValues(product?: AdminProductDetail) {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    brand: product?.brand ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    metaTitle: product?.metaTitle ?? '',
    metaDescription: product?.metaDescription ?? '',
    metaKeywords: product?.metaKeywords ?? '',
    isActive: product?.isActive ?? true,
  }
}

function toPayload(value: ReturnType<typeof toFormValues>) {
  return {
    name: value.name,
    slug: value.slug.trim() || undefined,
    brand: value.brand.trim() || undefined,
    shortDescription: value.shortDescription.trim() || undefined,
    description: value.description.trim() || undefined,
    metaTitle: value.metaTitle.trim() || undefined,
    metaDescription: value.metaDescription.trim() || undefined,
    metaKeywords: value.metaKeywords.trim() || undefined,
    isActive: value.isActive,
  }
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
  const form = useForm({
    defaultValues: toFormValues(product),
    validators: {
      onSubmit: adminProductFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSave(value)
    },
  })

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <AdminPageHeader
        title={mode === 'create' ? 'محصول جدید' : 'ویرایش محصول'}
        description={
          mode === 'create'
            ? 'ابتدا اطلاعات پایه را ذخیره کنید، سپس تصاویر و تنوع‌ها را اضافه کنید.'
            : product?.name
        }
      />

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <form.Field name="name">
              {field => (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="name">نام محصول</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slug">
              {field => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">اسلاگ (URL)</Label>
                  <Input
                    id="slug"
                    dir="ltr"
                    className="font-mono text-start"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder={slugify(form.state.values.name) || 'product-slug'}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="brand">
              {field => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="brand">برند</Label>
                  <Input
                    id="brand"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="shortDescription">
              {field => (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="shortDescription">توضیح کوتاه (لیست محصولات)</Label>
                  <Textarea
                    id="shortDescription"
                    rows={2}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {field => (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="description">توضیحات کامل</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="isActive">
              {field => (
                <div className="flex items-center gap-3 md:col-span-2">
                  <Switch
                    id="isActive"
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <Label htmlFor="isActive">نمایش در فروشگاه</Label>
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سئو (SEO)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form.Field name="metaTitle">
              {field => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="metaTitle">عنوان متا (حداکثر ~۷۰ کاراکتر)</Label>
                  <Input
                    id="metaTitle"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="metaDescription">
              {field => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="metaDescription">توضیح متا (حداکثر ~۱۶۰ کاراکتر)</Label>
                  <Textarea
                    id="metaDescription"
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="metaKeywords">
              {field => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="metaKeywords">کلمات کلیدی (با ویرگول جدا کنید)</Label>
                  <Input
                    id="metaKeywords"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'در حال ذخیره…' : 'ذخیره محصول'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard/admin/products">بازگشت به لیست</Link>
            </Button>
          </CardFooter>
        </Card>
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
