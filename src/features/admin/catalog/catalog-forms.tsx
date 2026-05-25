import type { AnyFieldApi } from '@tanstack/react-form'
import type {
  AdminAttribute,
  adminAttributeInputSchema,
  AdminBrand,
  adminBrandInputSchema,
  AdminCategory,
  adminCategoryInputSchema,
  AdminCollection,
  adminCollectionInputSchema,
  AdminTag,
  adminTagInputSchema,
} from '#/orpc/schemas/admin/catalog'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import {
  DialogFooter,
} from '#/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
import { Textarea } from '#/components/ui/textarea'
import { useShowFieldError } from '#/features/settings/components/field-validation'
import { slugify } from '#/lib/slug'
import {
  adminAttributeInputSchema as attributeInputSchema,
  adminBrandInputSchema as brandInputSchema,
  adminCategoryInputSchema as categoryInputSchema,
  adminCollectionInputSchema as collectionInputSchema,
  adminTagInputSchema as tagInputSchema,
} from '#/orpc/schemas/admin/catalog'

type BrandPayload = z.infer<typeof adminBrandInputSchema>
type CategoryPayload = z.infer<typeof adminCategoryInputSchema>
type AttributePayload = z.infer<typeof adminAttributeInputSchema>
type CollectionPayload = z.infer<typeof adminCollectionInputSchema>
type TagPayload = z.infer<typeof adminTagInputSchema>

interface BrandFormValue {
  name: string
  slug: string
  description: string
  websiteUrl: string
  isActive: boolean
}

interface CategoryFormValue {
  name: string
  slug: string
  parentId: string
  description: string
  sortOrder: number
  isActive: boolean
}

interface AttributeFormValue {
  name: string
  code: string
  type: AttributePayload['type']
  scope: AttributePayload['scope']
  unit: string
  isFilterable: boolean
  isVariantOption: boolean
  isRequired: boolean
  valuesText: string
}

interface CollectionFormValue {
  name: string
  slug: string
  type: NonNullable<CollectionPayload['type']>
  description: string
  isActive: boolean
}

interface TagFormValue {
  name: string
  slug: string
  type: NonNullable<TagPayload['type']>
  color: string
  isActive: boolean
}

const brandFormSchema = brandInputSchema.extend({
  description: z.string().trim().max(2000),
  websiteUrl: z.string().trim().max(255),
  isActive: z.boolean(),
})

const categoryFormSchema = categoryInputSchema.extend({
  parentId: z.string(),
  description: z.string().trim().max(2000),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

const attributeFormSchema = attributeInputSchema.omit({ values: true }).extend({
  unit: z.string().trim().max(30),
  isFilterable: z.boolean(),
  isVariantOption: z.boolean(),
  isRequired: z.boolean(),
  valuesText: z.string().trim().max(10000),
})

const collectionFormSchema = collectionInputSchema.extend({
  description: z.string().trim().max(2000),
  type: z.enum(['manual', 'smart']),
  isActive: z.boolean(),
})

const tagFormSchema = tagInputSchema.extend({
  type: z.enum(['tag', 'label']),
  color: z.string().trim().max(20),
  isActive: z.boolean(),
})

export const emptyBrandForm: BrandFormValue = {
  name: '',
  slug: '',
  description: '',
  websiteUrl: '',
  isActive: true,
}

export const emptyCategoryForm: CategoryFormValue = {
  name: '',
  slug: '',
  parentId: 'none',
  description: '',
  sortOrder: 0,
  isActive: true,
}

export const emptyAttributeForm: AttributeFormValue = {
  name: '',
  code: '',
  type: 'text',
  scope: 'product',
  unit: '',
  isFilterable: true,
  isVariantOption: false,
  isRequired: false,
  valuesText: '',
}

export const emptyCollectionForm: CollectionFormValue = {
  name: '',
  slug: '',
  type: 'manual',
  description: '',
  isActive: true,
}

export const emptyTagForm: TagFormValue = {
  name: '',
  slug: '',
  type: 'tag',
  color: '',
  isActive: true,
}

export function brandToForm(item: AdminBrand): BrandFormValue {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description ?? '',
    websiteUrl: item.websiteUrl ?? '',
    isActive: item.isActive,
  }
}

export function categoryToForm(item: AdminCategory): CategoryFormValue {
  return {
    name: item.name,
    slug: item.slug,
    parentId: item.parentId ?? 'none',
    description: item.description ?? '',
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  }
}

export function attributeToForm(item: AdminAttribute): AttributeFormValue {
  return {
    name: item.name,
    code: item.code,
    type: item.type,
    scope: item.scope,
    unit: item.unit ?? '',
    isFilterable: item.isFilterable,
    isVariantOption: item.isVariantOption,
    isRequired: item.isRequired,
    valuesText: item.values.map(value => value.value).join('\n'),
  }
}

export function collectionToForm(item: AdminCollection): CollectionFormValue {
  return {
    name: item.name,
    slug: item.slug,
    type: item.type,
    description: item.description ?? '',
    isActive: item.isActive,
  }
}

export function tagToForm(item: AdminTag): TagFormValue {
  return {
    name: item.name,
    slug: item.slug,
    type: item.type,
    color: item.color ?? '',
    isActive: item.isActive,
  }
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

function FieldErrors({ field }: { field: AnyFieldApi }) {
  const showError = useShowFieldError(field)
  return showError ? <FieldError errors={field.state.meta.errors} /> : null
}

function FormActions({
  isSaving,
  onCancel,
}: {
  isSaving: boolean
  onCancel: () => void
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        انصراف
      </Button>
      <Button type="submit" disabled={isSaving}>
        ذخیره
      </Button>
    </DialogFooter>
  )
}

export function BrandForm({
  defaultValues,
  isSaving,
  onCancel,
  onSubmit,
}: {
  defaultValues: BrandFormValue
  isSaving: boolean
  onCancel: () => void
  onSubmit: (value: BrandPayload) => Promise<unknown> | unknown
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: brandFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(brandInputSchema.parse({
        name: value.name,
        slug: value.slug,
        description: optionalText(value.description),
        websiteUrl: optionalText(value.websiteUrl),
        isActive: value.isActive,
      }))
    },
  })

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldSet>
        <FieldLegend>مشخصات برند</FieldLegend>
        <FieldDescription>
          این اطلاعات در محصول، فیلترها و صفحات برند استفاده می‌شود.
        </FieldDescription>
        <FieldGroup>
          <form.Field name="name">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نام</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const name = event.target.value
                    field.handleChange(name)
                    if (!form.state.values.slug) {
                      form.setFieldValue('slug', slugify(name))
                    }
                  }}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="slug">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>اسلاگ</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="websiteUrl">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>وب‌سایت</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>توضیحات</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="isActive">
            {field => (
              <Field orientation="horizontal">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <FieldLabel htmlFor={field.name}>فعال</FieldLabel>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}

export function CategoryForm({
  defaultValues,
  parentOptions,
  isSaving,
  onCancel,
  onSubmit,
}: {
  defaultValues: CategoryFormValue
  parentOptions: AdminCategory[]
  isSaving: boolean
  onCancel: () => void
  onSubmit: (value: CategoryPayload) => Promise<unknown> | unknown
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: categoryFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(categoryInputSchema.parse({
        name: value.name,
        slug: value.slug,
        parentId: value.parentId === 'none' ? null : value.parentId,
        description: optionalText(value.description),
        sortOrder: value.sortOrder,
        isActive: value.isActive,
      }))
    },
  })

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldSet>
        <FieldLegend>مشخصات دسته‌بندی</FieldLegend>
        <FieldDescription>
          برای ساخت زیرمجموعه، دسته والد را انتخاب کنید.
        </FieldDescription>
        <FieldGroup>
          <form.Field name="name">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نام</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const name = event.target.value
                    field.handleChange(name)
                    if (!form.state.values.slug) {
                      form.setFieldValue('slug', slugify(name))
                    }
                  }}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="slug">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>اسلاگ</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="parentId">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>دسته والد</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون والد</SelectItem>
                    {parentOptions.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="sortOrder">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>ترتیب نمایش</FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  dir="ltr"
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={event =>
                    field.handleChange(Number(event.target.value) || 0)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>توضیحات</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="isActive">
            {field => (
              <Field orientation="horizontal">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <FieldLabel htmlFor={field.name}>فعال</FieldLabel>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}

export function AttributeForm({
  defaultValues,
  isSaving,
  onCancel,
  onSubmit,
}: {
  defaultValues: AttributeFormValue
  isSaving: boolean
  onCancel: () => void
  onSubmit: (value: AttributePayload) => Promise<unknown> | unknown
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: attributeFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(attributeInputSchema.parse({
        name: value.name,
        code: value.code,
        type: value.type,
        scope: value.scope,
        unit: optionalText(value.unit),
        isFilterable: value.isFilterable,
        isVariantOption: value.isVariantOption,
        isRequired: value.isRequired,
        values: attributeValuesFromText(value.valuesText),
      }))
    },
  })

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldSet>
        <FieldLegend>مشخصات ویژگی</FieldLegend>
        <FieldDescription>
          ویژگی‌ها پایه فیلترها و ترکیب تنوع‌های محصول هستند.
        </FieldDescription>
        <FieldGroup>
          <form.Field name="name">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نام</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const name = event.target.value
                    field.handleChange(name)
                    if (!form.state.values.code) {
                      form.setFieldValue('code', slugify(name).replaceAll('-', '_'))
                    }
                  }}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="code">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>کد</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="type">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>نوع</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={value =>
                      field.handleChange(value as AttributeFormValue['type'])}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multiselect">Multi Select</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldErrors field={field} />
                </Field>
              )}
            </form.Field>

            <form.Field name="scope">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>محدوده</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={value =>
                      field.handleChange(value as AttributeFormValue['scope'])}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="variant">Variant</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldErrors field={field} />
                </Field>
              )}
            </form.Field>
          </div>

          <form.Field name="unit">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>واحد</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="valuesText">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>مقادیر انتخابی</FieldLabel>
                <Textarea
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldDescription>
                  هر مقدار را در یک خط بنویسید.
                </FieldDescription>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <div className="grid gap-3 md:grid-cols-3">
            <form.Field name="isFilterable">
              {field => (
                <Field orientation="horizontal">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <FieldLabel htmlFor={field.name}>قابل فیلتر</FieldLabel>
                  <FieldErrors field={field} />
                </Field>
              )}
            </form.Field>

            <form.Field name="isVariantOption">
              {field => (
                <Field orientation="horizontal">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <FieldLabel htmlFor={field.name}>گزینه تنوع</FieldLabel>
                  <FieldErrors field={field} />
                </Field>
              )}
            </form.Field>

            <form.Field name="isRequired">
              {field => (
                <Field orientation="horizontal">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <FieldLabel htmlFor={field.name}>اجباری</FieldLabel>
                  <FieldErrors field={field} />
                </Field>
              )}
            </form.Field>
          </div>
        </FieldGroup>
      </FieldSet>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}

export function CollectionForm({
  defaultValues,
  isSaving,
  onCancel,
  onSubmit,
}: {
  defaultValues: CollectionFormValue
  isSaving: boolean
  onCancel: () => void
  onSubmit: (value: CollectionPayload) => Promise<unknown> | unknown
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: collectionFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(collectionInputSchema.parse({
        name: value.name,
        slug: value.slug,
        type: value.type,
        description: optionalText(value.description),
        isActive: value.isActive,
      }))
    },
  })

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldSet>
        <FieldLegend>مشخصات کالکشن</FieldLegend>
        <FieldDescription>
          کالکشن‌ها برای صفحات کمپین، فصل و گروه‌بندی محصولات هستند.
        </FieldDescription>
        <FieldGroup>
          <form.Field name="name">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نام</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const name = event.target.value
                    field.handleChange(name)
                    if (!form.state.values.slug) {
                      form.setFieldValue('slug', slugify(name))
                    }
                  }}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="slug">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>اسلاگ</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="type">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نوع</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={value =>
                    field.handleChange(value as CollectionFormValue['type'])}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="smart">Smart</SelectItem>
                  </SelectContent>
                </Select>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>توضیحات</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="isActive">
            {field => (
              <Field orientation="horizontal">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <FieldLabel htmlFor={field.name}>فعال</FieldLabel>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}

export function TagForm({
  defaultValues,
  isSaving,
  onCancel,
  onSubmit,
}: {
  defaultValues: TagFormValue
  isSaving: boolean
  onCancel: () => void
  onSubmit: (value: TagPayload) => Promise<unknown> | unknown
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: tagFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(tagInputSchema.parse({
        name: value.name,
        slug: value.slug,
        type: value.type,
        color: optionalText(value.color),
        isActive: value.isActive,
      }))
    },
  })

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldSet>
        <FieldLegend>مشخصات تگ</FieldLegend>
        <FieldDescription>
          از لیبل برای Featured، New، Discounted و نشان‌های محصول استفاده کنید.
        </FieldDescription>
        <FieldGroup>
          <form.Field name="name">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نام</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    const name = event.target.value
                    field.handleChange(name)
                    if (!form.state.values.slug) {
                      form.setFieldValue('slug', slugify(name))
                    }
                  }}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="slug">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>اسلاگ</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="type">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>نوع</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={value =>
                    field.handleChange(value as TagFormValue['type'])}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tag">Tag</SelectItem>
                    <SelectItem value="label">Label</SelectItem>
                  </SelectContent>
                </Select>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="color">
            {field => (
              <Field>
                <FieldLabel htmlFor={field.name}>رنگ</FieldLabel>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  placeholder="#111827"
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          <form.Field name="isActive">
            {field => (
              <Field orientation="horizontal">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <FieldLabel htmlFor={field.name}>فعال</FieldLabel>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  )
}
