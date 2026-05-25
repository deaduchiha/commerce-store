import { z } from 'zod'

export const storefrontProductListInputSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(120).optional(),
  brandId: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1).optional(),
  tagId: z.string().trim().min(1).optional(),
})

export const storefrontProductListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  brand: z.string().nullable(),
  imagePath: z.string().nullable(),
  minPriceInRials: z.number().int().nullable(),
})

export const storefrontProductListSchema = z.object({
  items: z.array(storefrontProductListItemSchema),
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  pageCount: z.number().int().min(0),
})
