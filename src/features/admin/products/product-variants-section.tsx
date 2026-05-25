import type {
  AdminProductDetail,
  AdminProductVariantInput,
} from '#/orpc/schemas/admin/products'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
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

function rialsToTomans(value: number) {
  return Math.round(value / 10)
}

function tomansToRials(value: number) {
  return value * 10
}

function formatFa(value: number) {
  return value.toLocaleString('fa-IR')
}

function formatTomansFromRials(value: number) {
  return `${formatFa(rialsToTomans(value))} تومان`
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function validateVariants(variants: AdminProductVariantInput[]) {
  const errors = new Map<string, string>()
  const skuCounts = new Map<string, number>()

  variants.forEach((variant) => {
    const sku = variant.sku.trim()
    if (sku) {
      skuCounts.set(sku, (skuCounts.get(sku) ?? 0) + 1)
    }
  })

  variants.forEach((variant, index) => {
    const prefix = `variants.${index}`

    if (!variant.sku.trim()) {
      errors.set(`${prefix}.sku`, 'SKU لازم است.')
    }
    else if ((skuCounts.get(variant.sku.trim()) ?? 0) > 1) {
      errors.set(`${prefix}.sku`, 'SKU تکراری است.')
    }

    if (!variant.size.trim()) {
      errors.set(`${prefix}.size`, 'سایز لازم است.')
    }

    if (!variant.color.trim()) {
      errors.set(`${prefix}.color`, 'رنگ لازم است.')
    }

    if (variant.priceInRials < 1) {
      errors.set(`${prefix}.priceInRials`, 'قیمت باید بیشتر از صفر باشد.')
    }

    if (variant.stockQuantity < 0) {
      errors.set(`${prefix}.stockQuantity`, 'موجودی نمی‌تواند منفی باشد.')
    }

    if (
      variant.compareAtPriceInRials
      && variant.compareAtPriceInRials <= variant.priceInRials
    ) {
      errors.set(
        `${prefix}.compareAtPriceInRials`,
        'قیمت قبل از تخفیف باید از قیمت فروش بیشتر باشد.',
      )
    }
  })

  return errors
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
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => validateVariants(variants), [variants])
  const activeCount = variants.filter(variant => variant.isActive).length
  const totalStock = variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0,
  )

  const saveMutation = useMutation(
    orpc.admin.products.saveVariants.mutationOptions({
      onSuccess: () => {
        setSubmitted(false)
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

  function fieldError(index: number, field: keyof AdminProductVariantInput) {
    return errors.get(`variants.${index}.${field}`)
  }

  function handleSave() {
    setSubmitted(true)

    if (variants.length === 0) {
      toast.error('حداقل یک تنوع برای محصول اضافه کنید.')
      return
    }

    if (errors.size > 0) {
      toast.error('لطفا خطاهای فرم تنوع‌ها را برطرف کنید.')
      return
    }

    saveMutation.mutate({
      productId,
      variants: variants.map(({ id, ...rest }) => ({
        ...rest,
        id,
        sku: rest.sku.trim(),
        size: rest.size.trim(),
        color: rest.color.trim(),
      })),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>تنوع‌ها (سایز / رنگ)</CardTitle>
            <CardDescription>
              هر ردیف یک SKU قابل فروش با قیمت، موجودی و وضعیت جداگانه است.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {variants.length}
              {' '}
              ردیف
            </Badge>
            <Badge variant="secondary">
              {activeCount}
              {' '}
              فعال
            </Badge>
            <Badge variant={totalStock > 0 ? 'outline' : 'destructive'}>
              موجودی:
              {' '}
              {formatFa(totalStock)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {variants.length === 0 && (
          <div className="border bg-muted/20 p-4 text-sm text-muted-foreground">
            حداقل یک تنوع برای فروش آنلاین اضافه کنید.
          </div>
        )}

        {variants.map((variant, index) => (
          <div
            key={variant.id ?? `new-${index}`}
            className="flex flex-col gap-5 border p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  تنوع
                  {' '}
                  {index + 1}
                </Badge>
                {variant.id && <Badge variant="secondary">ذخیره‌شده</Badge>}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeVariant(index)}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <VariantField
                id={`variant-${index}-sku`}
                label="SKU"
                error={submitted ? fieldError(index, 'sku') : undefined}
              >
                <Input
                  id={`variant-${index}-sku`}
                  dir="ltr"
                  value={variant.sku}
                  aria-invalid={submitted && Boolean(fieldError(index, 'sku'))}
                  onChange={event =>
                    updateVariant(index, { sku: event.target.value })}
                />
              </VariantField>

              <VariantField
                id={`variant-${index}-size`}
                label="سایز"
                error={submitted ? fieldError(index, 'size') : undefined}
              >
                <Input
                  id={`variant-${index}-size`}
                  value={variant.size}
                  aria-invalid={submitted && Boolean(fieldError(index, 'size'))}
                  onChange={event =>
                    updateVariant(index, { size: event.target.value })}
                />
              </VariantField>

              <VariantField
                id={`variant-${index}-color`}
                label="رنگ"
                error={submitted ? fieldError(index, 'color') : undefined}
              >
                <Input
                  id={`variant-${index}-color`}
                  value={variant.color}
                  aria-invalid={submitted && Boolean(fieldError(index, 'color'))}
                  onChange={event =>
                    updateVariant(index, { color: event.target.value })}
                />
              </VariantField>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <VariantField
                id={`variant-${index}-price`}
                label="قیمت فروش (تومان)"
                helper={variant.priceInRials > 0
                  ? formatTomansFromRials(variant.priceInRials)
                  : '۰ تومان'}
                error={submitted ? fieldError(index, 'priceInRials') : undefined}
              >
                <Input
                  id={`variant-${index}-price`}
                  type="number"
                  min={0}
                  dir="ltr"
                  value={rialsToTomans(variant.priceInRials) || ''}
                  aria-invalid={
                    submitted && Boolean(fieldError(index, 'priceInRials'))
                  }
                  onChange={event =>
                    updateVariant(index, {
                      priceInRials: tomansToRials(toNumber(event.target.value)),
                    })}
                />
              </VariantField>

              <VariantField
                id={`variant-${index}-compare-price`}
                label="قیمت قبل از تخفیف (تومان)"
                helper={variant.compareAtPriceInRials
                  ? formatTomansFromRials(variant.compareAtPriceInRials)
                  : 'بدون قیمت قبل از تخفیف'}
                error={
                  submitted
                    ? fieldError(index, 'compareAtPriceInRials')
                    : undefined
                }
              >
                <Input
                  id={`variant-${index}-compare-price`}
                  type="number"
                  min={0}
                  dir="ltr"
                  value={variant.compareAtPriceInRials
                    ? rialsToTomans(variant.compareAtPriceInRials)
                    : ''}
                  aria-invalid={
                    submitted
                    && Boolean(fieldError(index, 'compareAtPriceInRials'))
                  }
                  onChange={event =>
                    updateVariant(index, {
                      compareAtPriceInRials: event.target.value
                        ? tomansToRials(toNumber(event.target.value))
                        : null,
                    })}
                />
              </VariantField>

              <VariantField
                id={`variant-${index}-stock`}
                label="موجودی"
                helper={`${formatFa(variant.stockQuantity)} عدد`}
                error={submitted ? fieldError(index, 'stockQuantity') : undefined}
              >
                <Input
                  id={`variant-${index}-stock`}
                  type="number"
                  min={0}
                  dir="ltr"
                  value={variant.stockQuantity || ''}
                  aria-invalid={
                    submitted && Boolean(fieldError(index, 'stockQuantity'))
                  }
                  onChange={event =>
                    updateVariant(index, {
                      stockQuantity: toNumber(event.target.value),
                    })}
                />
              </VariantField>

              <Field orientation="vertical">
                <FieldLabel htmlFor={`variant-active-${index}`}>وضعیت فروش</FieldLabel>
                <div className="flex h-8 items-center gap-3 border px-3">
                  <Switch
                    id={`variant-active-${index}`}
                    checked={variant.isActive}
                    onCheckedChange={checked =>
                      updateVariant(index, { isActive: checked })}
                  />
                  <span className="text-sm">
                    {variant.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <FieldDescription>
                  وضعیت این SKU در فروشگاه
                </FieldDescription>
              </Field>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" className="w-fit" onClick={addVariant}>
          <Plus />
          افزودن تنوع
        </Button>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4" />
          قیمت‌ها در فرم به تومان وارد می‌شوند.
        </div>
        <Button
          type="button"
          disabled={saveMutation.isPending}
          onClick={handleSave}
        >
          {saveMutation.isPending && <Loader2 className="animate-spin" />}
          {saveMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تنوع‌ها'}
        </Button>
      </CardFooter>
    </Card>
  )
}

function VariantField({
  id,
  label,
  helper,
  error,
  children,
}: {
  id: string
  label: string
  helper?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={Boolean(error)} className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {error
        ? <FieldError>{error}</FieldError>
        : helper && <FieldDescription>{helper}</FieldDescription>}
    </Field>
  )
}
