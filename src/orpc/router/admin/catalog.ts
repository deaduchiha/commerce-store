import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'
import { and, asc, eq, like, or, type SQL } from 'drizzle-orm'

import { db } from '#/db'
import {
  attributes,
  attributeValues,
  brands,
  categories,
  collectionProducts,
  collections,
  products,
  tags,
} from '#/db/schema'
import { rebuildCategoryClosure } from '#/lib/category-closure'
import { requireAdmin } from '#/orpc/lib/require-admin'
import {
  adminAttributeInputSchema,
  adminAttributeSchema,
  adminBrandInputSchema,
  adminBrandSchema,
  adminCategoryInputSchema,
  adminCategorySchema,
  adminCollectionInputSchema,
  adminCollectionProductSchema,
  adminCollectionProductsInputSchema,
  adminCollectionProductsUpdateSchema,
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
    rulesJson: row.rulesJson ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

function catalogListWhere(
  input: { search?: string, activeOnly?: boolean },
  searchFilter?: SQL,
  activeColumn?: SQL,
) {
  const filters: SQL[] = []

  if (input.activeOnly && activeColumn) {
    filters.push(activeColumn)
  }

  if (searchFilter) {
    filters.push(searchFilter)
  }

  if (filters.length === 0) {
    return undefined
  }

  if (filters.length === 1) {
    return filters[0]
  }

  return and(...filters)
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
      .where(catalogListWhere(
        input,
        search ? or(like(brands.name, `%${search}%`), like(brands.slug, `%${search}%`)) : undefined,
        input.activeOnly ? eq(brands.isActive, true) : undefined,
      ))
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
      .where(catalogListWhere(
        input,
        search ? or(like(categories.name, `%${search}%`), like(categories.slug, `%${search}%`)) : undefined,
        input.activeOnly ? eq(categories.isActive, true) : undefined,
      ))
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

    await rebuildCategoryClosure()

    return categoryDto(row!)
  })

export const updateCategory = os
  .input(catalogIdSchema.extend({ data: adminCategoryInputSchema.partial() }))
  .handler(async ({ context, input }) => {
    await assertAdmin(context)

    if (input.data.parentId === input.id) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'A category cannot be its own parent.',
      })
    }

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
      throw new ORPCError('NOT_FOUND', { message: 'دسته‌بندی پیدا نشد.' })
    }

    await rebuildCategoryClosure()

    return categoryDto(row)
  })

export const deleteBrand = os
  .input(catalogIdSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .delete(brands)
      .where(eq(brands.id, input.id))
      .returning({ id: brands.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Brand not found.' })
    }

    return row
  })

export const deleteCategory = os
  .input(catalogIdSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .delete(categories)
      .where(eq(categories.id, input.id))
      .returning({ id: categories.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'دسته‌بندی پیدا نشد.' })
    }

    await rebuildCategoryClosure()

    return row
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

export const updateAttribute = os
  .input(catalogIdSchema.extend({ data: adminAttributeInputSchema.partial() }))
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .update(attributes)
      .set({
        code: input.data.code,
        name: input.data.name,
        type: input.data.type,
        scope: input.data.scope,
        unit: input.data.unit !== undefined
          ? emptyToNull(input.data.unit)
          : undefined,
        isFilterable: input.data.isFilterable,
        isVariantOption: input.data.isVariantOption,
        isRequired: input.data.isRequired,
        sortOrder: input.data.sortOrder,
      })
      .where(eq(attributes.id, input.id))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Attribute not found.' })
    }

    if (input.data.values) {
      await db
        .delete(attributeValues)
        .where(eq(attributeValues.attributeId, input.id))

      if (input.data.values.length > 0) {
        await db.insert(attributeValues).values(
          input.data.values.map(value => ({
            attributeId: input.id,
            value: value.value,
            slug: emptyToNull(value.slug),
            colorHex: emptyToNull(value.colorHex),
            sortOrder: value.sortOrder ?? 0,
          })),
        )
      }
    }

    return attributeDto(row)
  })

export const deleteAttribute = os
  .input(catalogIdSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .delete(attributes)
      .where(eq(attributes.id, input.id))
      .returning({ id: attributes.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Attribute not found.' })
    }

    return row
  })

export const listCollections = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(collections)
      .where(catalogListWhere(
        input,
        search ? or(like(collections.name, `%${search}%`), like(collections.slug, `%${search}%`)) : undefined,
        input.activeOnly ? eq(collections.isActive, true) : undefined,
      ))
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

export const updateCollection = os
  .input(catalogIdSchema.extend({ data: adminCollectionInputSchema.partial() }))
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .update(collections)
      .set({
        slug: input.data.slug,
        name: input.data.name,
        description: input.data.description !== undefined
          ? emptyToNull(input.data.description)
          : undefined,
        type: input.data.type,
        rulesJson: input.data.rulesJson !== undefined
          ? emptyToNull(input.data.rulesJson)
          : undefined,
        isActive: input.data.isActive,
      })
      .where(eq(collections.id, input.id))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Collection not found.' })
    }

    return collectionDto(row)
  })

export const deleteCollection = os
  .input(catalogIdSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .delete(collections)
      .where(eq(collections.id, input.id))
      .returning({ id: collections.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Collection not found.' })
    }

    return row
  })

export const listTags = os
  .input(catalogListInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(tags)
      .where(catalogListWhere(
        input,
        search ? or(like(tags.name, `%${search}%`), like(tags.slug, `%${search}%`)) : undefined,
        input.activeOnly ? eq(tags.isActive, true) : undefined,
      ))
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

export const updateTag = os
  .input(catalogIdSchema.extend({ data: adminTagInputSchema.partial() }))
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .update(tags)
      .set({
        slug: input.data.slug,
        name: input.data.name,
        type: input.data.type,
        color: input.data.color !== undefined
          ? emptyToNull(input.data.color)
          : undefined,
        isActive: input.data.isActive,
      })
      .where(eq(tags.id, input.id))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Tag not found.' })
    }

    return tagDto(row)
  })

export const deleteTag = os
  .input(catalogIdSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)
    const [row] = await db
      .delete(tags)
      .where(eq(tags.id, input.id))
      .returning({ id: tags.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Tag not found.' })
    }

    return row
  })

export const listCollectionProducts = os
  .input(adminCollectionProductsInputSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sortOrder: collectionProducts.sortOrder,
      })
      .from(collectionProducts)
      .innerJoin(products, eq(collectionProducts.productId, products.id))
      .where(eq(collectionProducts.collectionId, input.collectionId))
      .orderBy(asc(collectionProducts.sortOrder), asc(products.name))

    return rows.map(row => adminCollectionProductSchema.parse(row))
  })

export const setCollectionProducts = os
  .input(adminCollectionProductsUpdateSchema)
  .handler(async ({ context, input }) => {
    await assertAdmin(context)

    const [collection] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.id, input.collectionId))
      .limit(1)

    if (!collection) {
      throw new ORPCError('NOT_FOUND', { message: 'کالکشن پیدا نشد.' })
    }

    await db
      .delete(collectionProducts)
      .where(eq(collectionProducts.collectionId, input.collectionId))

    const uniqueProductIds = [...new Set(input.productIds)]

    if (uniqueProductIds.length > 0) {
      await db.insert(collectionProducts).values(
        uniqueProductIds.map((productId, index) => ({
          collectionId: input.collectionId,
          productId,
          sortOrder: index,
        })),
      )
    }

    return { collectionId: input.collectionId, count: uniqueProductIds.length }
  })
