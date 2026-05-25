import { z } from 'zod'

export const catalogIdSchema = z.object({
  id: z.string().min(1),
})

export const catalogListInputSchema = z.object({
  search: z.string().trim().max(120).optional(),
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
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  websiteUrl: z.string().trim().max(255).optional(),
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
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  sortOrder: z.number().int().min(0).optional(),
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
  value: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(120).optional(),
  colorHex: z.string().trim().max(20).optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const adminAttributeInputSchema = z.object({
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'color', 'date']),
  scope: z.enum(['product', 'variant', 'both']),
  unit: z.string().trim().max(30).optional(),
  isFilterable: z.boolean().optional(),
  isVariantOption: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  values: z.array(adminAttributeValueInputSchema).optional(),
})

export const adminCollectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(['manual', 'smart']),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminCollectionInputSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(['manual', 'smart']).optional(),
  rulesJson: z.string().trim().max(10000).optional(),
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
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  type: z.enum(['tag', 'label']).optional(),
  color: z.string().trim().max(20).optional(),
  isActive: z.boolean().optional(),
})

export type AdminBrand = z.infer<typeof adminBrandSchema>
export type AdminCategory = z.infer<typeof adminCategorySchema>
export type AdminAttribute = z.infer<typeof adminAttributeSchema>
export type AdminCollection = z.infer<typeof adminCollectionSchema>
export type AdminTag = z.infer<typeof adminTagSchema>
