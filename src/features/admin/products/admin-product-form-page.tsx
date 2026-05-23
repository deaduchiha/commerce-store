import type { AdminProduct } from '#/orpc/schemas/admin/products'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'
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
import { slugify } from '#/lib/slug'
import { orpc } from '#/orpc/client'
import { adminProductFormSchema } from '#/orpc/schemas/admin/products'

interface AdminProductFormPageProps {
  mode: 'create' | 'edit'
  productId?: string
}

export function AdminProductFormPage({ mode, productId }: AdminProductFormPageProps) {
  const productQuery = useQuery({
    ...orpc.admin.products.get.queryOptions({ input: { id: productId! } }),
    enabled: mode === 'edit' && Boolean(productId),
  })

  if (mode === 'edit') {
    if (productQuery.isPending) {
      return <Skeleton className="h-96 w-full" />
    }

    if (productQuery.isError || !productQuery.data) {
      return <p className="text-destructive text-sm">محصول یافت نشد.</p>
    }

    return (
      <ProductForm
        key={productQuery.data.id}
        mode="edit"
        productId={productId!}
        initial={productQuery.data}
      />
    )
  }

  return <ProductForm mode="create" />
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  productId?: string
  initial?: AdminProduct
}

function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    orpc.admin.products.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.admin.products.list.key(),
        })
        toast.success('محصول ایجاد شد.')
        void navigate({ to: '/dashboard/admin/products' })
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
        toast.success('محصول به‌روزرسانی شد.')
        void navigate({ to: '/dashboard/admin/products' })
      },
      onError: () => toast.error('به‌روزرسانی محصول انجام نشد.'),
    }),
  )

  const isSaving = createMutation.isPending || updateMutation.isPending

  const form = useForm({
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      brand: initial?.brand ?? '',
      description: initial?.description ?? '',
      isActive: initial?.isActive ?? true,
    },
    validators: {
      onSubmit: adminProductFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        slug: value.slug.trim() || undefined,
        brand: value.brand.trim() || undefined,
        description: value.description.trim() || undefined,
        isActive: value.isActive,
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        return
      }

      await updateMutation.mutateAsync({
        id: productId!,
        data: payload,
      })
    },
  })

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'محصول جدید' : 'ویرایش محصول'}
        </CardTitle>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <form.Field name="name">
            {field => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">نام</Label>
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
                <Label htmlFor="slug">اسلاگ (اختیاری)</Label>
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

          <form.Field name="description">
            {field => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="isActive">
            {field => (
              <div className="flex items-center gap-3">
                <Switch
                  id="isActive"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="isActive">فعال در فروشگاه</Label>
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'در حال ذخیره…' : 'ذخیره'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/admin/products">انصراف</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
