import type {
  AdminProductDetail,
  AdminProductVariantInput,
} from '#/orpc/schemas/admin/products'
import { useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { orpc } from '#/orpc/client'

function emptyVariant(): AdminProductVariantInput {
  return {
    sku: '',
    size: '',
    color: '',
    priceInRials: 0,
    compareAtPriceInRials: null,
    stockQuantity: 0,
    isActive: true,
  }
}

function fromDetail(variants: AdminProductDetail['variants']): AdminProductVariantInput[] {
  return variants.map(v => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    priceInRials: v.priceInRials,
    compareAtPriceInRials: v.compareAtPriceInRials,
    stockQuantity: v.stockQuantity,
    isActive: v.isActive,
  }))
}

interface ProductVariantsSectionProps {
  productId: string
  variants: AdminProductDetail['variants']
  onSaved: () => void
}

export function ProductVariantsSection({
  productId,
  variants: initialVariants,
  onSaved,
}: ProductVariantsSectionProps) {
  const [variants, setVariants] = useState(() => fromDetail(initialVariants))

  const saveMutation = useMutation(
    orpc.admin.products.saveVariants.mutationOptions({
      onSuccess: () => {
        toast.success('تنوع‌ها ذخیره شد.')
        onSaved()
      },
      onError: () => toast.error('ذخیره تنوع‌ها انجام نشد.'),
    }),
  )

  function updateVariant(
    index: number,
    patch: Partial<AdminProductVariantInput>,
  ) {
    setVariants(prev =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    )
  }

  function addVariant() {
    setVariants(prev => [...prev, emptyVariant()])
  }

  function removeVariant(index: number) {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنوع‌ها (سایز / رنگ)</CardTitle>
        <CardDescription>
          هر تنوع SKU، قیمت به ریال، موجودی و وضعیت فعال جداگانه دارد.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {variants.length === 0 && (
          <p className="text-muted-foreground text-sm">
            حداقل یک تنوع برای فروش آنلاین اضافه کنید.
          </p>
        )}

        {variants.map((variant, index) => (
          <div
            key={variant.id ?? `new-${index}`}
            className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  تنوع
                  {' '}
                  {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeVariant(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>SKU</Label>
              <Input
                dir="ltr"
                className="font-mono"
                value={variant.sku}
                onChange={e => updateVariant(index, { sku: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>سایز</Label>
              <Input
                value={variant.size}
                onChange={e => updateVariant(index, { size: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>رنگ</Label>
              <Input
                value={variant.color}
                onChange={e => updateVariant(index, { color: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>قیمت (ریال)</Label>
              <Input
                type="number"
                min={0}
                dir="ltr"
                value={variant.priceInRials || ''}
                onChange={e =>
                  updateVariant(index, {
                    priceInRials: Number(e.target.value) || 0,
                  })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>قیمت قبل از تخفیف (ریال)</Label>
              <Input
                type="number"
                min={0}
                dir="ltr"
                value={variant.compareAtPriceInRials ?? ''}
                onChange={e =>
                  updateVariant(index, {
                    compareAtPriceInRials: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>موجودی</Label>
              <Input
                type="number"
                min={0}
                dir="ltr"
                value={variant.stockQuantity || ''}
                onChange={e =>
                  updateVariant(index, {
                    stockQuantity: Number(e.target.value) || 0,
                  })}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={variant.isActive}
                onCheckedChange={checked =>
                  updateVariant(index, { isActive: checked })}
              />
              <Label>فعال</Label>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" className="w-fit" onClick={addVariant}>
          <Plus />
          افزودن تنوع
        </Button>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => {
            saveMutation.mutate({
              productId,
              variants: variants.map(({ id, ...rest }) => ({
                ...rest,
                id,
              })),
            })
          }}
        >
          {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره تنوع‌ها'}
        </Button>
      </CardFooter>
    </Card>
  )
}
