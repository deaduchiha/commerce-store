import { z } from 'zod'

const catalogNameSchema = z
  .string()
  .trim()
  .min(1, 'نام را وارد کنید.')
  .max(120, 'نام نباید بیشتر از ۱۲۰ کاراکتر باشد.')

const catalogSlugSchema = z
  .string()
  .trim()
  .min(1, 'اسلاگ را وارد کنید.')
  .max(120, 'اسلاگ نباید بیشتر از ۱۲۰ کاراکتر باشد.')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'اسلاگ باید با حروف انگلیسی کوچک، عدد و خط تیره نوشته شود.',
  )

const catalogDescriptionSchema = z
  .string()
  .trim()
  .max(2000, 'توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.')

const catalogWebsiteSchema = z
  .string()
  .trim()
  .max(255, 'آدرس وب‌سایت نباید بیشتر از ۲۵۵ کاراکتر باشد.')
  .url('آدرس وب‌سایت معتبر نیست.')

const catalogColorSchema = z
  .string()
  .trim()
  .max(20, 'کد رنگ نباید بیشتر از ۲۰ کاراکتر باشد.')
  .regex(
    /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i,
    'رنگ باید به‌صورت HEX معتبر مثل #111827 باشد.',
  )

export const catalogIdSchema = z.object({
  id: z.string().min(1, 'شناسه معتبر نیست.'),
})

export const catalogListInputSchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, 'عبارت جستجو نباید بیشتر از ۱۲۰ کاراکتر باشد.')
    .optional(),
  activeOnly: z.boolean().optional(),
})

export const adminBrandSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminBrandInputSchema = z.object({
  slug: catalogSlugSchema,
  name: catalogNameSchema,
  description: catalogDescriptionSchema.optional(),
  websiteUrl: catalogWebsiteSchema.optional(),
  isActive: z.boolean().optional(),
})

export const adminCategorySchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminCategoryInputSchema = z.object({
  parentId: z.string().nullable().optional(),
  slug: catalogSlugSchema,
  name: catalogNameSchema,
  description: catalogDescriptionSchema.optional(),
  sortOrder: z
    .number()
    .int('ترتیب نمایش باید عدد صحیح باشد.')
    .min(0, 'ترتیب نمایش نمی‌تواند منفی باشد.')
    .optional(),
  isActive: z.boolean().optional(),
})

export const adminAttributeValueSchema = z.object({
  id: z.string(),
  attributeId: z.string(),
  value: z.string(),
  slug: z.string().nullable(),
  colorHex: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const adminAttributeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'color', 'date']),
  scope: z.enum(['product', 'variant', 'both']),
  unit: z.string().nullable(),
  isFilterable: z.boolean(),
  isVariantOption: z.boolean(),
  isRequired: z.boolean(),
  sortOrder: z.number().int(),
  values: z.array(adminAttributeValueSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminAttributeValueInputSchema = z.object({
  id: z.string().optional(),
  value: z
    .string()
    .trim()
    .min(1, 'مقدار ویژگی را وارد کنید.')
    .max(120, 'مقدار ویژگی نباید بیشتر از ۱۲۰ کاراکتر باشد.'),
  slug: z
    .string()
    .trim()
    .optional()
    .transform(slug => slug || undefined)
    .pipe(catalogSlugSchema.optional()),
  colorHex: catalogColorSchema.optional(),
  sortOrder: z
    .number()
    .int('ترتیب نمایش باید عدد صحیح باشد.')
    .min(0, 'ترتیب نمایش نمی‌تواند منفی باشد.')
    .optional(),
})

export const adminAttributeInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'کد ویژگی را وارد کنید.')
    .max(80, 'کد ویژگی نباید بیشتر از ۸۰ کاراکتر باشد.')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'کد ویژگی باید با حرف انگلیسی کوچک شروع شود و فقط شامل حرف، عدد و _ باشد.',
    ),
  name: catalogNameSchema,
  type: z.enum(
    ['text', 'number', 'boolean', 'select', 'multiselect', 'color', 'date'],
    { error: 'نوع ویژگی معتبر نیست.' },
  ),
  scope: z.enum(['product', 'variant', 'both'], {
    error: 'محدوده ویژگی معتبر نیست.',
  }),
  unit: z
    .string()
    .trim()
    .max(30, 'واحد نباید بیشتر از ۳۰ کاراکتر باشد.')
    .optional(),
  isFilterable: z.boolean().optional(),
  isVariantOption: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  sortOrder: z
    .number()
    .int('ترتیب نمایش باید عدد صحیح باشد.')
    .min(0, 'ترتیب نمایش نمی‌تواند منفی باشد.')
    .optional(),
  values: z.array(adminAttributeValueInputSchema).optional(),
})

export const adminCollectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(['manual', 'smart']),
  rulesJson: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminCollectionProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number().int(),
})

export const adminCollectionProductsInputSchema = z.object({
  collectionId: z.string().min(1),
})

export const adminCollectionProductsUpdateSchema = z.object({
  collectionId: z.string().min(1),
  productIds: z.array(z.string().min(1)),
})

export const adminCollectionInputSchema = z.object({
  slug: catalogSlugSchema,
  name: catalogNameSchema,
  description: catalogDescriptionSchema.optional(),
  type: z.enum(['manual', 'smart'], {
    error: 'نوع کالکشن معتبر نیست.',
  }).optional(),
  rulesJson: z
    .string()
    .trim()
    .max(10000, 'قوانین کالکشن نباید بیشتر از ۱۰۰۰۰ کاراکتر باشد.')
    .optional(),
  isActive: z.boolean().optional(),
})

export const adminTagSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.enum(['tag', 'label']),
  color: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminTagInputSchema = z.object({
  slug: catalogSlugSchema,
  name: catalogNameSchema,
  type: z.enum(['tag', 'label'], {
    error: 'نوع تگ معتبر نیست.',
  }).optional(),
  color: catalogColorSchema.optional(),
  isActive: z.boolean().optional(),
})

export type AdminBrand = z.infer<typeof adminBrandSchema>
export type AdminCategory = z.infer<typeof adminCategorySchema>
export type AdminAttribute = z.infer<typeof adminAttributeSchema>
export type AdminCollection = z.infer<typeof adminCollectionSchema>
export type AdminTag = z.infer<typeof adminTagSchema>
