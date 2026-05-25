import type { AnyFieldApi } from '@tanstack/react-form'
import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'
import { useForm } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-form'
import { useRef } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { useCatalogSlugSync } from './use-catalog-slug-sync'

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
import { slugify, slugifyAttributeValue } from '#/lib/slug'
import {
  adminAttributeInputSchema as attributeInputSchema,
  adminAttributeValueInputSchema,
  adminBrandInputSchema as brandInputSchema,
  adminCategoryInputSchema as categoryInputSchema,
  adminCollectionInputSchema as collectionInputSchema,
  adminTagInputSchema as tagInputSchema,
} from '#/orpc/schemas/admin/catalog'

type BrandPayload = z.infer<typeof brandInputSchema>
type CategoryPayload = z.infer<typeof categoryInputSchema>
type AttributePayload = z.infer<typeof attributeInputSchema>
type CollectionPayload = z.infer<typeof collectionInputSchema>
type TagPayload = z.infer<typeof tagInputSchema>

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
  rulesJson: string
  isActive: boolean
}

const attributeTypeLabels: Record<AttributeFormValue['type'], string> = {
  text: 'متن',
  number: 'عدد',
  boolean: 'بله/خیر',
  select: 'انتخابی',
  multiselect: 'چندانتخابی',
  color: 'رنگ',
  date: 'تاریخ',
}

const attributeScopeLabels: Record<AttributeFormValue['scope'], string> = {
  product: 'محصول',
  variant: 'تنوع',
  both: 'هر دو',
}

const collectionTypeLabels: Record<CollectionFormValue['type'], string> = {
  manual: 'دستی',
  smart: 'هوشمند',
}

const tagTypeLabels: Record<TagFormValue['type'], string> = {
  tag: 'تگ',
  label: 'لیبل',
}

interface TagFormValue {
  name: string
  slug: string
  type: NonNullable<TagPayload['type']>
  color: string
  isActive: boolean
}

const brandFormSchema = brandInputSchema.extend({
  description: z
    .string()
    .trim()
    .max(2000, 'توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.'),
  websiteUrl: z
    .string()
    .trim()
    .max(255, 'آدرس وب‌سایت نباید بیشتر از ۲۵۵ کاراکتر باشد.')
    .refine(
      value => value === '' || z.string().url().safeParse(value).success,
      'آدرس وب‌سایت معتبر نیست.',
    ),
  isActive: z.boolean(),
})

const categoryFormSchema = categoryInputSchema.extend({
  parentId: z.string(),
  description: z
    .string()
    .trim()
    .max(2000, 'توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.'),
  sortOrder: z
    .number()
    .int('ترتیب نمایش باید عدد صحیح باشد.')
    .min(0, 'ترتیب نمایش نمی‌تواند منفی باشد.'),
  isActive: z.boolean(),
})

const attributeFormSchema = attributeInputSchema.omit({ values: true }).extend({
  unit: z
    .string()
    .trim()
    .max(30, 'واحد نباید بیشتر از ۳۰ کاراکتر باشد.'),
  isFilterable: z.boolean(),
  isVariantOption: z.boolean(),
  isRequired: z.boolean(),
  valuesText: z
    .string()
    .trim()
    .max(10000, 'مقادیر ویژگی نباید بیشتر از ۱۰۰۰۰ کاراکتر باشد.'),
})

const collectionFormSchema = collectionInputSchema.extend({
  description: z
    .string()
    .trim()
    .max(2000, 'توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.'),
  type: z.enum(['manual', 'smart'], {
    error: 'نوع کالکشن معتبر نیست.',
  }),
  rulesJson: z
    .string()
    .trim()
    .max(10000, 'قوانین کالکشن نباید بیشتر از ۱۰۰۰۰ کاراکتر باشد.')
    .superRefine((value, ctx) => {
      if (!value) {
        return
      }

      try {
        JSON.parse(value)
      }
      catch {
        ctx.addIssue({
          code: 'custom',
          message: 'قوانین کالکشن باید JSON معتبر باشد.',
        })
      }
    }),
  isActive: z.boolean(),
})

const tagFormSchema = tagInputSchema.extend({
  type: z.enum(['tag', 'label'], {
    error: 'نوع تگ معتبر نیست.',
  }),
  color: z
    .string()
    .trim()
    .max(20, 'کد رنگ نباید بیشتر از ۲۰ کاراکتر باشد.')
    .refine(
      value => value === '' || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value),
      'رنگ باید به‌صورت HEX معتبر مثل #111827 باشد.',
    ),
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
  rulesJson: '{\n  "match": "all"\n}',
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
    rulesJson: item.rulesJson ?? '{\n  "match": "all"\n}',
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
      slug: slugifyAttributeValue(value, index),
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
  const slugSync = useCatalogSlugSync(defaultValues.slug)
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
                    slugSync.syncSlugFromName(name, slug =>
                      form.setFieldValue('slug', slug))
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
                <FieldDescription>
                  برای نام فارسی، اسلاگ را با حروف انگلیسی وارد کنید.
                </FieldDescription>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    slugSync.markSlugTouched()
                    field.handleChange(event.target.value)
                  }}
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
  const slugSync = useCatalogSlugSync(defaultValues.slug)
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
                    slugSync.syncSlugFromName(name, slug =>
                      form.setFieldValue('slug', slug))
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
                <FieldDescription>
                  برای نام فارسی، اسلاگ را با حروف انگلیسی وارد کنید.
                </FieldDescription>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    slugSync.markSlugTouched()
                    field.handleChange(event.target.value)
                  }}
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
  mode,
  isSaving,
  onCancel,
  onSubmit,
}: {
  defaultValues: AttributeFormValue
  mode: 'create' | 'edit'
  isSaving: boolean
  onCancel: () => void
  onSubmit: (
    value: AttributePayload | Partial<AttributePayload>,
  ) => Promise<unknown> | unknown
}) {
  const codeSync = useCatalogSlugSync(defaultValues.code)
  const initialValuesTextRef = useRef(defaultValues.valuesText.trim())

  const form = useForm({
    defaultValues,
    validators: { onSubmit: attributeFormSchema },
    onSubmit: async ({ value }) => {
      const base = {
        name: value.name,
        code: value.code,
        type: value.type,
        scope: value.scope,
        unit: optionalText(value.unit),
        isFilterable: value.isFilterable,
        isVariantOption: value.isVariantOption,
        isRequired: value.isRequired,
      }

      const valuesChanged =
        mode === 'create'
        || value.valuesText.trim() !== initialValuesTextRef.current

      if (mode === 'create') {
        const parsed = attributeInputSchema.safeParse({
          ...base,
          values: attributeValuesFromText(value.valuesText),
        })

        if (!parsed.success) {
          const first = parsed.error.issues[0]
          toast.error(first?.message ?? 'داده‌های ویژگی معتبر نیست.')
          return
        }

        await onSubmit(parsed.data)
        return
      }

      const patch: Partial<AttributePayload> = { ...base }

      if (valuesChanged) {
        const values = attributeValuesFromText(value.valuesText)
        const valuesParsed = z
          .array(adminAttributeValueInputSchema)
          .safeParse(values)

        if (!valuesParsed.success) {
          const first = valuesParsed.error.issues[0]
          toast.error(first?.message ?? 'مقادیر ویژگی معتبر نیست.')
          return
        }

        patch.values = valuesParsed.data
      }

      await onSubmit(patch)
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
                    codeSync.syncSlugFromName(name, () =>
                      form.setFieldValue('code', slugify(name).replaceAll('-', '_')))
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
                  onChange={(event) => {
                    codeSync.markSlugTouched()
                    field.handleChange(event.target.value)
                  }}
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
                      {Object.entries(attributeTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
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
                      {Object.entries(attributeScopeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
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
                <Field orientation="vertical" className="gap-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                    <FieldLabel htmlFor={field.name}>گزینه تنوع</FieldLabel>
                  </div>
                  <FieldDescription>
                    فقط نمایش در فرم تنوع محصول را کنترل می‌کند؛ مقادیر
                    انتخابی در دیتابیس حفظ می‌شوند.
                  </FieldDescription>
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
  const slugSync = useCatalogSlugSync(defaultValues.slug)
  const form = useForm({
    defaultValues,
    validators: { onSubmit: collectionFormSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(collectionInputSchema.parse({
        name: value.name,
        slug: value.slug,
        type: value.type,
        description: optionalText(value.description),
        rulesJson: value.type === 'smart'
          ? optionalText(value.rulesJson)
          : undefined,
        isActive: value.isActive,
      }))
    },
  })
  const collectionType = useStore(form.store, state => state.values.type)

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
                    slugSync.syncSlugFromName(name, slug =>
                      form.setFieldValue('slug', slug))
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
                <FieldDescription>
                  برای نام فارسی، اسلاگ را با حروف انگلیسی وارد کنید.
                </FieldDescription>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    slugSync.markSlugTouched()
                    field.handleChange(event.target.value)
                  }}
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
                    {Object.entries(collectionTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldErrors field={field} />
              </Field>
            )}
          </form.Field>

          {collectionType === 'smart' && (
            <form.Field name="rulesJson">
              {field => (
                <Field>
                  <FieldLabel htmlFor={field.name}>قوانین (JSON)</FieldLabel>
                  <FieldDescription>
                    قوانین فیلتر محصولات هوشمند را به‌صورت JSON وارد کنید.
                  </FieldDescription>
                  <Textarea
                    id={field.name}
                    dir="ltr"
                    className="min-h-32 font-mono text-sm"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={event => field.handleChange(event.target.value)}
                  />
                  <FieldErrors field={field} />
                </Field>
              )}
            </form.Field>
          )}

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
  const slugSync = useCatalogSlugSync(defaultValues.slug)
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
                    slugSync.syncSlugFromName(name, slug =>
                      form.setFieldValue('slug', slug))
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
                <FieldDescription>
                  برای نام فارسی، اسلاگ را با حروف انگلیسی وارد کنید.
                </FieldDescription>
                <Input
                  id={field.name}
                  dir="ltr"
                  value={field.state.value}
                  autoComplete="off"
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    slugSync.markSlugTouched()
                    field.handleChange(event.target.value)
                  }}
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
                    {Object.entries(tagTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
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
