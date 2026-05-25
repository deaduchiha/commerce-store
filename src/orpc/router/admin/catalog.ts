import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'
import { asc, eq, like, or } from 'drizzle-orm'

import { db } from '#/db'
import {
  attributes,
  attributeValues,
  brands,
  categories,
  collections,
  tags,
} from '#/db/schema'
import { requireAdmin } from '#/orpc/lib/require-admin'
import {
  adminAttributeInputSchema,
  adminAttributeSchema,
  adminBrandInputSchema,
  adminBrandSchema,
  adminCategoryInputSchema,
  adminCategorySchema,
  adminCollectionInputSchema,
  adminCollectionSchema,
  adminTagInputSchema,
  adminTagSchema,
  catalogIdSchema,
  catalogListInputSchema,
} from '#/orpc/schemas/admin/catalog'

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || null
}

function brandDto(row: typeof brands.$inferSelect) {
  return adminBrandSchema.parse({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    websiteUrl: row.websiteUrl ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

function categoryDto(row: typeof categories.$inferSelect) {
  return adminCategorySchema.parse({
    id: row.id,
    parentId: row.parentId ?? null,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

async function attributeDto(row: typeof attributes.$inferSelect) {
  const values = await db
    .select()
    .from(attributeValues)
    .where(eq(attributeValues.attributeId, row.id))
    .orderBy(asc(attributeValues.sortOrder), asc(attributeValues.value))

  return adminAttributeSchema.parse({
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    scope: row.scope,
    unit: row.unit ?? null,
    isFilterable: row.isFilterable,
    isVariantOption: row.isVariantOption,
    isRequired: row.isRequired,
    sortOrder: row.sortOrder,
    values: values.map(value => ({
      id: value.id,
      attributeId: value.attributeId,
      value: value.value,
      slug: value.slug ?? null,
      colorHex: value.colorHex ?? null,
      sortOrder: value.sortOrder,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

function collectionDto(row: typeof collections.$inferSelect) {
  return adminCollectionSchema.parse({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    type: row.type,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

function tagDto(row: typeof tags.$inferSelect) {
  return adminTagSchema.parse({
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    color: row.color ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

async function assertAdmin(context: unknown) {
  const { headers } = context as OrpcContext
  await requireAdmin(headers)
}

export const listBrands = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(brands)
      .where(search ? or(like(brands.name, `%${search}%`), like(brands.slug, `%${search}%`)) : undefined)
      .orderBy(asc(brands.name))

    return rows.map(brandDto)
  })

export const createBrand = os
  .input(adminBrandInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .insert(brands)
      .values({
        slug: input.slug,
        name: input.name,
        description: emptyToNull(input.description),
        websiteUrl: emptyToNull(input.websiteUrl),
        isActive: input.isActive ?? true,
      })
      .returning()

    return brandDto(row!)
  })

export const updateBrand = os
  .input(catalogIdSchema.extend({ data: adminBrandInputSchema.partial() }))
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .update(brands)
      .set({
        slug: input.data.slug,
        name: input.data.name,
        description: input.data.description !== undefined
          ? emptyToNull(input.data.description)
          : undefined,
        websiteUrl: input.data.websiteUrl !== undefined
          ? emptyToNull(input.data.websiteUrl)
          : undefined,
        isActive: input.data.isActive,
      })
      .where(eq(brands.id, input.id))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Brand not found.' })
    }

    return brandDto(row)
  })

export const listCategories = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(categories)
      .where(search ? or(like(categories.name, `%${search}%`), like(categories.slug, `%${search}%`)) : undefined)
      .orderBy(asc(categories.sortOrder), asc(categories.name))

    return rows.map(categoryDto)
  })

export const createCategory = os
  .input(adminCategoryInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .insert(categories)
      .values({
        parentId: input.parentId ?? null,
        slug: input.slug,
        name: input.name,
        description: emptyToNull(input.description),
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      })
      .returning()

    return categoryDto(row!)
  })

export const updateCategory = os
  .input(catalogIdSchema.extend({ data: adminCategoryInputSchema.partial() }))
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .update(categories)
      .set({
        parentId: input.data.parentId,
        slug: input.data.slug,
        name: input.data.name,
        description: input.data.description !== undefined
          ? emptyToNull(input.data.description)
          : undefined,
        sortOrder: input.data.sortOrder,
        isActive: input.data.isActive,
      })
      .where(eq(categories.id, input.id))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Category not found.' })
    }

    return categoryDto(row)
  })

export const listAttributes = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(attributes)
      .where(search ? or(like(attributes.name, `%${search}%`), like(attributes.code, `%${search}%`)) : undefined)
      .orderBy(asc(attributes.sortOrder), asc(attributes.name))

    return Promise.all(rows.map(attributeDto))
  })

export const createAttribute = os
  .input(adminAttributeInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .insert(attributes)
      .values({
        code: input.code,
        name: input.name,
        type: input.type,
        scope: input.scope,
        unit: emptyToNull(input.unit),
        isFilterable: input.isFilterable ?? false,
        isVariantOption: input.isVariantOption ?? false,
        isRequired: input.isRequired ?? false,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning()

    if (input.values?.length) {
      await db.insert(attributeValues).values(
        input.values.map(value => ({
          attributeId: row!.id,
          value: value.value,
          slug: emptyToNull(value.slug),
          colorHex: emptyToNull(value.colorHex),
          sortOrder: value.sortOrder ?? 0,
        })),
      )
    }

    return attributeDto(row!)
  })

export const listCollections = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(collections)
      .where(search ? or(like(collections.name, `%${search}%`), like(collections.slug, `%${search}%`)) : undefined)
      .orderBy(asc(collections.name))

    return rows.map(collectionDto)
  })

export const createCollection = os
  .input(adminCollectionInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .insert(collections)
      .values({
        slug: input.slug,
        name: input.name,
        description: emptyToNull(input.description),
        type: input.type ?? 'manual',
        rulesJson: emptyToNull(input.rulesJson),
        isActive: input.isActive ?? true,
      })
      .returning()

    return collectionDto(row!)
  })

export const listTags = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(tags)
      .where(search ? or(like(tags.name, `%${search}%`), like(tags.slug, `%${search}%`)) : undefined)
      .orderBy(asc(tags.name))

    return rows.map(tagDto)
  })

export const createTag = os
  .input(adminTagInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .insert(tags)
      .values({
        slug: input.slug,
        name: input.name,
        type: input.type ?? 'tag',
        color: emptyToNull(input.color),
        isActive: input.isActive ?? true,
      })
      .returning()

    return tagDto(row!)
  })
