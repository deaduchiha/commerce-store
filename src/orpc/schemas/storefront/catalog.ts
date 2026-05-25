import { z } from 'zod'

export const storefrontCatalogFilterBrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export const storefrontCatalogFilterCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const storefrontCatalogFilterTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export const storefrontCatalogFiltersSchema = z.object({
  brands: z.array(storefrontCatalogFilterBrandSchema),
  categories: z.array(storefrontCatalogFilterCategorySchema),
  tags: z.array(storefrontCatalogFilterTagSchema),
})
