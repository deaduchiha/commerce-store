import { z } from 'zod'

export const adminProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  isActive: z.boolean(),
  variantCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/** Client form — empty strings for unset optional fields. */
export const adminProductFormSchema = z.object({
  name: z.string().trim().min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد').max(120),
  slug: z.string(),
  brand: z.string(),
  description: z.string(),
  isActive: z.boolean(),
})

export const adminProductInputSchema = z.object({
  name: z.string().trim().min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد').max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'اسلاگ نامعتبر است')
    .optional(),
  description: z.string().trim().max(5000).optional(),
  brand: z.string().trim().max(80).optional(),
  isActive: z.boolean().optional(),
})

export const adminProductIdSchema = z.object({
  id: z.string().min(1),
})

export type AdminProduct = z.infer<typeof adminProductSchema>
export type AdminProductInput = z.infer<typeof adminProductInputSchema>
