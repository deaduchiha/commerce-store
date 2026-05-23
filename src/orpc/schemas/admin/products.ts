import { z } from 'zod'

export const adminProductImageSchema = z.object({
  id: z.string(),
  productId: z.string(),
  path: z.string(),
  alt: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
})

export const adminProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  size: z.string(),
  color: z.string(),
  priceInRials: z.number().int().min(0),
  compareAtPriceInRials: z.number().int().min(0).nullable(),
  stockQuantity: z.number().int().min(0),
  isActive: z.boolean(),
})

export const adminProductListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  brand: z.string().nullable(),
  isActive: z.boolean(),
  variantCount: z.number().int(),
  imagePath: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminProductListInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(120).optional(),
})

export const adminProductListSchema = z.object({
  items: z.array(adminProductListItemSchema),
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  pageCount: z.number().int().min(0),
})

export const adminProductDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  isActive: z.boolean(),
  images: z.array(adminProductImageSchema),
  variants: z.array(adminProductVariantSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminProductFormSchema = z.object({
  name: z.string().trim().min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد').max(120),
  slug: z.string(),
  brand: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  metaKeywords: z.string(),
  isActive: z.boolean(),
})

export const adminProductMetaSchema = z.object({
  title: z.string().trim().max(70).optional(),
  description: z.string().trim().max(160).optional(),
  keywords: z.string().trim().max(255).optional(),
})

export const adminProductFormWithMetaSchema = z.object({
  name: z.string().trim().min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد').max(120),
  slug: z.string(),
  brand: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  metaJson: z.string().superRefine((value, ctx) => {
    try {
      adminProductMetaSchema.parse(JSON.parse(value))
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        for (const issue of error.issues) {
          ctx.addIssue({
            code: 'custom',
            message: issue.message,
            path: issue.path,
          })
        }
        return
      }

      ctx.addIssue({
        code: 'custom',
        message: 'JSON متادیتا معتبر نیست.',
      })
    }
  }),
  isActive: z.boolean(),
})

export const adminProductInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  brand: z.string().trim().max(80).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().max(10000).optional(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  metaKeywords: z.string().trim().max(255).optional(),
  isActive: z.boolean().optional(),
})

export const adminProductVariantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1).max(64),
  size: z.string().trim().min(1).max(32),
  color: z.string().trim().min(1).max(64),
  priceInRials: z.number().int().min(0),
  compareAtPriceInRials: z.number().int().min(0).nullable().optional(),
  stockQuantity: z.number().int().min(0),
  isActive: z.boolean(),
})

export const saveProductVariantsInputSchema = z.object({
  productId: z.string().min(1),
  variants: z.array(adminProductVariantInputSchema),
})

export const adminProductIdSchema = z.object({
  id: z.string().min(1),
})

export type AdminProductDetail = z.infer<typeof adminProductDetailSchema>
export type AdminProductVariant = z.infer<typeof adminProductVariantSchema>
export type AdminProductImage = z.infer<typeof adminProductImageSchema>
export type AdminProductListItem = z.infer<typeof adminProductListItemSchema>
export type AdminProductList = z.infer<typeof adminProductListSchema>
export type AdminProductMeta = z.infer<typeof adminProductMetaSchema>
export type AdminProductVariantInput = z.infer<
  typeof adminProductVariantInputSchema
>
