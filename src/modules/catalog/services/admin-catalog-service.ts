import type { SQL } from 'drizzle-orm'
import type { z } from 'zod'
import type {
  adminAttributeInputSchema,
  adminBrandInputSchema,
  adminCategoryInputSchema,
  adminCategoryReorderSchema,
  adminCollectionInputSchema,
  adminCollectionProductsInputSchema,
  adminCollectionProductsUpdateSchema,
  adminTagInputSchema,
  catalogIdSchema,
  catalogListInputSchema,
} from '#/orpc/schemas/admin/catalog'
import { ORPCError } from '@orpc/server'

import { and, asc, eq, inArray, isNull, like, or } from 'drizzle-orm'
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
import { slugifyAttributeValue } from '#/lib/slug'
import {
  adminAttributeSchema,
  adminBrandSchema,
  adminCategorySchema,
  adminCollectionProductSchema,
  adminCollectionSchema,
  adminTagSchema,
} from '#/orpc/schemas/admin/catalog'

type CatalogIdInput = z.infer<typeof catalogIdSchema>
type CatalogListInput = z.infer<typeof catalogListInputSchema>
type BrandInput = z.infer<typeof adminBrandInputSchema>
type CategoryInput = z.infer<typeof adminCategoryInputSchema>
type CategoryReorderInput = z.infer<typeof adminCategoryReorderSchema>
type AttributeInput = z.infer<typeof adminAttributeInputSchema>
type CollectionInput = z.infer<typeof adminCollectionInputSchema>
type TagInput = z.infer<typeof adminTagInputSchema>
type CollectionProductsInput = z.infer<typeof adminCollectionProductsInputSchema>
type CollectionProductsUpdateInput = z.infer<
  typeof adminCollectionProductsUpdateSchema
>

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || null
}

async function syncAttributeValues(
  attributeId: string,
  incoming: NonNullable<AttributeInput['values']>,
) {
  const existing = await db
    .select()
    .from(attributeValues)
    .where(eq(attributeValues.attributeId, attributeId))

  const keptIds = new Set<string>()

  for (const [index, item] of incoming.entries()) {
    const slug = emptyToNull(item.slug) ?? slugifyAttributeValue(item.value, index)
    const sortOrder = item.sortOrder ?? index

    const match = item.id
      ? existing.find(row => row.id === item.id)
      : existing.find(
          row =>
            (slug && row.slug === slug)
            || row.value === item.value,
        )

    if (match) {
      keptIds.add(match.id)
      await db
        .update(attributeValues)
        .set({
          value: item.value,
          slug,
          colorHex: emptyToNull(item.colorHex),
          sortOrder,
        })
        .where(eq(attributeValues.id, match.id))
    }
    else {
      const [inserted] = await db
        .insert(attributeValues)
        .values({
          attributeId,
          value: item.value,
          slug,
          colorHex: emptyToNull(item.colorHex),
          sortOrder,
        })
        .returning({ id: attributeValues.id })

      if (inserted) {
        keptIds.add(inserted.id)
      }
    }
  }

  const removeIds = existing
    .filter(row => !keptIds.has(row.id))
    .map(row => row.id)

  if (removeIds.length > 0) {
    await db
      .delete(attributeValues)
      .where(inArray(attributeValues.id, removeIds))
  }
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

  return filters.length === 1 ? filters[0] : and(...filters)
}

export const adminCatalogService = {
  async listBrands(input: CatalogListInput) {
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(brands)
      .where(catalogListWhere(
        input,
        search
          ? or(
              like(brands.name, `%${search}%`),
              like(brands.slug, `%${search}%`),
            )
          : undefined,
        input.activeOnly ? eq(brands.isActive, true) : undefined,
      ))
      .orderBy(asc(brands.name))

    return rows.map(brandDto)
  },

  async createBrand(input: BrandInput) {
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
  },

  async updateBrand(input: CatalogIdInput & { data: Partial<BrandInput> }) {
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
      throw new ORPCError('NOT_FOUND', { message: 'برند پیدا نشد.' })
    }

    return brandDto(row)
  },

  async deleteBrand(input: CatalogIdInput) {
    const [row] = await db
      .delete(brands)
      .where(eq(brands.id, input.id))
      .returning({ id: brands.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'برند پیدا نشد.' })
    }

    return row
  },

  async listCategories(input: CatalogListInput) {
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(categories)
      .where(catalogListWhere(
        input,
        search
          ? or(
              like(categories.name, `%${search}%`),
              like(categories.slug, `%${search}%`),
            )
          : undefined,
        input.activeOnly ? eq(categories.isActive, true) : undefined,
      ))
      .orderBy(asc(categories.sortOrder), asc(categories.name))

    return rows.map(categoryDto)
  },

  async createCategory(input: CategoryInput) {
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
  },

  async updateCategory(
    input: CatalogIdInput & { data: Partial<CategoryInput> },
  ) {
    if (input.data.parentId === input.id) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'یک دسته‌بندی نمی‌تواند والد خودش باشد.',
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
  },

  async reorderCategories(input: CategoryReorderInput) {
    const parentId = input.parentId ?? null
    const parentCondition = parentId === null
      ? isNull(categories.parentId)
      : eq(categories.parentId, parentId)

    const siblings = await db
      .select({ id: categories.id })
      .from(categories)
      .where(parentCondition)

    const siblingIds = new Set(siblings.map(row => row.id))
    const orderedSet = new Set(input.orderedIds)

    if (
      siblingIds.size !== input.orderedIds.length
      || orderedSet.size !== input.orderedIds.length
      || input.orderedIds.some(id => !siblingIds.has(id))
    ) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'ترتیب دسته‌بندی‌ها معتبر نیست.',
      })
    }

    for (const [index, id] of input.orderedIds.entries()) {
      await db
        .update(categories)
        .set({ sortOrder: index })
        .where(eq(categories.id, id))
    }

    return { parentId, count: input.orderedIds.length }
  },

  async deleteCategory(input: CatalogIdInput) {
    const [row] = await db
      .delete(categories)
      .where(eq(categories.id, input.id))
      .returning({ id: categories.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'دسته‌بندی پیدا نشد.' })
    }

    await rebuildCategoryClosure()

    return row
  },

  async listAttributes(input: CatalogListInput) {
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(attributes)
      .where(
        search
          ? or(
              like(attributes.name, `%${search}%`),
              like(attributes.code, `%${search}%`),
            )
          : undefined,
      )
      .orderBy(asc(attributes.sortOrder), asc(attributes.name))

    return Promise.all(rows.map(attributeDto))
  },

  async createAttribute(input: AttributeInput) {
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
  },

  async updateAttribute(
    input: CatalogIdInput & { data: Partial<AttributeInput> },
  ) {
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
      throw new ORPCError('NOT_FOUND', { message: 'ویژگی پیدا نشد.' })
    }

    if (input.data.values !== undefined) {
      await syncAttributeValues(input.id, input.data.values)
    }

    return attributeDto(row)
  },

  async deleteAttribute(input: CatalogIdInput) {
    const [row] = await db
      .delete(attributes)
      .where(eq(attributes.id, input.id))
      .returning({ id: attributes.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'ویژگی پیدا نشد.' })
    }

    return row
  },

  async listCollections(input: CatalogListInput) {
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(collections)
      .where(catalogListWhere(
        input,
        search
          ? or(
              like(collections.name, `%${search}%`),
              like(collections.slug, `%${search}%`),
            )
          : undefined,
        input.activeOnly ? eq(collections.isActive, true) : undefined,
      ))
      .orderBy(asc(collections.name))

    return rows.map(collectionDto)
  },

  async createCollection(input: CollectionInput) {
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
  },

  async updateCollection(
    input: CatalogIdInput & { data: Partial<CollectionInput> },
  ) {
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
      throw new ORPCError('NOT_FOUND', { message: 'کالکشن پیدا نشد.' })
    }

    return collectionDto(row)
  },

  async deleteCollection(input: CatalogIdInput) {
    const [row] = await db
      .delete(collections)
      .where(eq(collections.id, input.id))
      .returning({ id: collections.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'کالکشن پیدا نشد.' })
    }

    return row
  },

  async listTags(input: CatalogListInput) {
    const search = input.search?.trim()
    const rows = await db
      .select()
      .from(tags)
      .where(catalogListWhere(
        input,
        search
          ? or(like(tags.name, `%${search}%`), like(tags.slug, `%${search}%`))
          : undefined,
        input.activeOnly ? eq(tags.isActive, true) : undefined,
      ))
      .orderBy(asc(tags.name))

    return rows.map(tagDto)
  },

  async createTag(input: TagInput) {
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
  },

  async updateTag(input: CatalogIdInput & { data: Partial<TagInput> }) {
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
      throw new ORPCError('NOT_FOUND', { message: 'تگ پیدا نشد.' })
    }

    return tagDto(row)
  },

  async deleteTag(input: CatalogIdInput) {
    const [row] = await db
      .delete(tags)
      .where(eq(tags.id, input.id))
      .returning({ id: tags.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'تگ پیدا نشد.' })
    }

    return row
  },

  async listCollectionProducts(input: CollectionProductsInput) {
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
  },

  async setCollectionProducts(input: CollectionProductsUpdateInput) {
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
  },
}
