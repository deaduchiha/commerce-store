import type { AnyFieldApi } from '@tanstack/react-form'
import type { z } from 'zod'
import type { AdminAttribute } from '#/orpc/schemas/admin/catalog'
import type { adminProductAttributeValueSchema } from '#/orpc/schemas/admin/products'
import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import {
  Field,
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
import { Switch } from '#/components/ui/switch'
import { useShowFieldError } from '#/features/settings/components/field-validation'
import { buildCategoryTreeOptions } from '#/lib/catalog-categories'

type AdminProductAttributeValue = z.infer<typeof adminProductAttributeValueSchema>

export function ProductCategoriesField({
  field,
  options,
}: {
  field: AnyFieldApi
  options: Array<{ id: string, name: string, parentId: string | null, sortOrder: number }>
}) {
  const selectedIds = new Set<string>(field.state.value as string[])
  const showError = useShowFieldError(field)
  const treeOptions = buildCategoryTreeOptions(options)

  function toggleCategory(categoryId: string) {
    const current = field.state.value as string[]
    const nextIds = selectedIds.has(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId]

    field.handleChange(nextIds)
  }

  return (
    <Field data-invalid={showError} className="md:col-span-2">
      <FieldLabel>دسته‌بندی‌ها</FieldLabel>
      <FieldDescription>
        محصول می‌تواند در چند دسته و زیرمجموعه هم‌زمان قرار بگیرد.
        {' '}
        <Link
          to="/dashboard/admin/catalog/categories"
          className="text-primary underline-offset-4 hover:underline"
        >
          مدیریت دسته‌بندی‌ها
        </Link>
      </FieldDescription>
      <div className="grid gap-2">
        {treeOptions.length === 0
          ? (
              <div className="text-muted-foreground flex flex-col gap-2 border p-3 text-sm">
                <span>ابتدا از بخش کاتالوگ دسته‌بندی بسازید.</span>
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <Link to="/dashboard/admin/catalog/categories">
                    رفتن به دسته‌بندی‌ها
                  </Link>
                </Button>
              </div>
            )
          : treeOptions.map(category => (
              <button
                key={category.id}
                type="button"
                data-selected={selectedIds.has(category.id)}
                className="flex min-h-11 items-center justify-between gap-2 border bg-background px-3 py-2 text-start text-sm transition-colors hover:bg-muted/50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                onClick={() => toggleCategory(category.id)}
              >
                <span>{category.label}</span>
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

function CatalogMultiSelectField({
  field,
  label,
  description,
  emptyMessage,
  catalogLink,
  catalogLinkLabel,
  options,
}: {
  field: AnyFieldApi
  label: string
  description: string
  emptyMessage: string
  catalogLink: '/dashboard/admin/catalog/tags' | '/dashboard/admin/catalog/collections'
  catalogLinkLabel: string
  options: Array<{ id: string, name: string }>
}) {
  const selectedIds = new Set<string>(field.state.value as string[])
  const showError = useShowFieldError(field)

  function toggleOption(optionId: string) {
    const current = field.state.value as string[]
    const nextIds = selectedIds.has(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId]

    field.handleChange(nextIds)
  }

  return (
    <Field data-invalid={showError} className="md:col-span-2">
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>
        {description}
        {' '}
        <Link
          to={catalogLink}
          className="text-primary underline-offset-4 hover:underline"
        >
          {catalogLinkLabel}
        </Link>
      </FieldDescription>
      <div className="grid gap-2">
        {options.length === 0
          ? (
              <div className="text-muted-foreground flex flex-col gap-2 border p-3 text-sm">
                <span>{emptyMessage}</span>
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <Link to={catalogLink}>{catalogLinkLabel}</Link>
                </Button>
              </div>
            )
          : options.map(option => (
              <button
                key={option.id}
                type="button"
                data-selected={selectedIds.has(option.id)}
                className="flex min-h-11 items-center justify-between gap-2 border bg-background px-3 py-2 text-start text-sm transition-colors hover:bg-muted/50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                onClick={() => toggleOption(option.id)}
              >
                <span>{option.name}</span>
                {selectedIds.has(option.id) && (
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

export function ProductTagsField({
  field,
  options,
}: {
  field: AnyFieldApi
  options: Array<{ id: string, name: string }>
}) {
  return (
    <CatalogMultiSelectField
      field={field}
      label="تگ‌ها و لیبل‌ها"
      description="برای نشان‌هایی مثل New، Featured و پرفروش."
      emptyMessage="ابتدا از بخش کاتالوگ تگ بسازید."
      catalogLink="/dashboard/admin/catalog/tags"
      catalogLinkLabel="مدیریت تگ‌ها"
      options={options}
    />
  )
}

export function ProductCollectionsField({
  field,
  options,
}: {
  field: AnyFieldApi
  options: Array<{ id: string, name: string }>
}) {
  return (
    <CatalogMultiSelectField
      field={field}
      label="کالکشن‌ها"
      description="گروه‌های دستی محصول برای کمپین و صفحات ویژه."
      emptyMessage="ابتدا از بخش کاتالوگ کالکشن بسازید."
      catalogLink="/dashboard/admin/catalog/collections"
      catalogLinkLabel="مدیریت کالکشن‌ها"
      options={options}
    />
  )
}

function getAttributeValue(
  values: AdminProductAttributeValue[],
  attributeId: string,
) {
  return values.find(value => value.attributeId === attributeId)
}

export function ProductAttributesField({
  field,
  attributes,
}: {
  field: AnyFieldApi
  attributes: AdminAttribute[]
}) {
  const values = field.state.value as AdminProductAttributeValue[]
  const showError = useShowFieldError(field)
  const productAttributes = attributes.filter(
    attribute => attribute.scope === 'product' || attribute.scope === 'both',
  )

  function updateValue(
    attributeId: string,
    patch: Partial<AdminProductAttributeValue>,
  ) {
    const current = [...values]
    const index = current.findIndex(value => value.attributeId === attributeId)

    if (index === -1) {
      field.handleChange([
        ...current,
        {
          attributeId,
          attributeValueId: null,
          valueText: null,
          valueNumber: null,
          valueBoolean: null,
          ...patch,
        },
      ])
      return
    }

    current[index] = { ...current[index]!, ...patch }
    field.handleChange(current)
  }

  return (
    <Field data-invalid={showError} className="md:col-span-2">
      <FieldLabel>ویژگی‌های محصول</FieldLabel>
      <FieldDescription>
        ویژگی‌های سطح محصول از کاتالوگ.
        {' '}
        <Link
          to="/dashboard/admin/catalog/attributes"
          className="text-primary underline-offset-4 hover:underline"
        >
          مدیریت ویژگی‌ها
        </Link>
      </FieldDescription>
      {productAttributes.length === 0
        ? (
            <div className="text-muted-foreground flex flex-col gap-2 border p-3 text-sm">
              <span>ویژگی سطح محصولی در کاتالوگ تعریف نشده است.</span>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link to="/dashboard/admin/catalog/attributes">
                  افزودن ویژگی
                </Link>
              </Button>
            </div>
          )
        : (
            <div className="grid gap-4 md:grid-cols-2">
              {productAttributes.map((attribute) => {
                const current = getAttributeValue(values, attribute.id)

                if (
                  attribute.type === 'select'
                  || attribute.type === 'multiselect'
                  || attribute.type === 'color'
                ) {
                  return (
                    <Field key={attribute.id}>
                      <FieldLabel>{attribute.name}</FieldLabel>
                      <Select
                        value={current?.attributeValueId ?? 'none'}
                        onValueChange={(value) => {
                          updateValue(attribute.id, {
                            attributeValueId: value === 'none' ? null : value,
                            valueText: null,
                            valueNumber: null,
                            valueBoolean: null,
                          })
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {attribute.values.map(value => (
                            <SelectItem key={value.id} value={value.id}>
                              {value.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )
                }

                if (attribute.type === 'boolean') {
                  return (
                    <Field key={attribute.id} orientation="horizontal">
                      <Switch
                        checked={Boolean(current?.valueBoolean)}
                        onCheckedChange={checked =>
                          updateValue(attribute.id, {
                            valueBoolean: checked,
                            attributeValueId: null,
                            valueText: null,
                            valueNumber: null,
                          })}
                      />
                      <FieldLabel>{attribute.name}</FieldLabel>
                    </Field>
                  )
                }

                if (attribute.type === 'number') {
                  return (
                    <Field key={attribute.id}>
                      <FieldLabel>{attribute.name}</FieldLabel>
                      <Input
                        type="number"
                        dir="ltr"
                        value={current?.valueNumber?.toString() ?? ''}
                        onChange={(event) => {
                          const raw = event.target.value
                          updateValue(attribute.id, {
                            valueNumber: raw === '' ? null : Number(raw),
                            attributeValueId: null,
                            valueText: null,
                            valueBoolean: null,
                          })
                        }}
                      />
                    </Field>
                  )
                }

                return (
                  <Field key={attribute.id}>
                    <FieldLabel>{attribute.name}</FieldLabel>
                    <Input
                      value={current?.valueText ?? ''}
                      onChange={event =>
                        updateValue(attribute.id, {
                          valueText: event.target.value || null,
                          attributeValueId: null,
                          valueNumber: null,
                          valueBoolean: null,
                        })}
                    />
                  </Field>
                )
              })}
            </div>
          )}
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
