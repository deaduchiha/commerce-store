import type { z } from 'zod'
import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'
import { and, asc, count, desc, eq, like, notInArray, or } from 'drizzle-orm'

import { db } from '#/db'
import {
  productCategories,
  productImages,
  products,
  productVariants,
} from '#/db/schema'
import { slugify } from '#/lib/slug'
import { deleteProductImageFile } from '#/lib/uploads/product-images'
import { requireAdmin } from '#/orpc/lib/require-admin'
import {
  adminProductDetailSchema,
  adminProductIdSchema,
  adminProductInputSchema,
  adminProductListInputSchema,
  adminProductListItemSchema,
  adminProductListSchema,
  saveProductVariantsInputSchema,
} from '#/orpc/schemas/admin/products'

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || null
}

function toProductImage(row: typeof productImages.$inferSelect) {
  return {
    id: row.id,
    productId: row.productId,
    path: row.path,
    alt: row.alt ?? null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
  }
}

function toProductVariant(row: typeof productVariants.$inferSelect) {
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    size: row.size,
    color: row.color,
    priceInRials: row.priceInRials,
    compareAtPriceInRials: row.compareAtPriceInRials ?? null,
    stockQuantity: row.stockQuantity,
    isActive: row.isActive,
  }
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base
  let suffix = 0

  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1)

    if (!existing || existing.id === excludeId) {
      return slug
    }

    suffix += 1
    slug = `${base}-${suffix}`
  }
}

async function loadProductDetail(productId: string) {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!row) {
    return null
  }

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(productVariants.createdAt))

  const categories = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId))

  return adminProductDetailSchema.parse({
    id: row.id,
    productType: row.productType,
    status: row.status,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription ?? null,
    description: row.description ?? null,
    brandId: row.brandId ?? null,
    brand: row.brand ?? null,
    categoryIds: categories.map(category => category.categoryId),
    metaTitle: row.metaTitle ?? null,
    metaDescription: row.metaDescription ?? null,
    metaKeywords: row.metaKeywords ?? null,
    requiresShipping: row.requiresShipping,
    isDigital: row.isDigital,
    isActive: row.isActive,
    images: images.map(toProductImage),
    variants: variants.map(toProductVariant),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

async function replaceProductCategories(
  productId: string,
  categoryIds: string[] | undefined,
) {
  if (!categoryIds) {
    return
  }

  await db
    .delete(productCategories)
    .where(eq(productCategories.productId, productId))

  const uniqueCategoryIds = [...new Set(categoryIds)]

  if (uniqueCategoryIds.length === 0) {
    return
  }

  await db.insert(productCategories).values(
    uniqueCategoryIds.map(categoryId => ({
      productId,
      categoryId,
    })),
  )
}

function productPatchFromInput(
  input: Partial<z.infer<typeof adminProductInputSchema>>,
  existing?: typeof products.$inferSelect,
) {
  return {
    productType: input.productType ?? existing?.productType ?? 'simple',
    status: input.status ?? existing?.status ?? 'active',
    name: input.name ?? existing?.name,
    brandId:
      input.brandId !== undefined ? emptyToNull(input.brandId) : existing?.brandId,
    shortDescription:
      input.shortDescription !== undefined
        ? emptyToNull(input.shortDescription)
        : existing?.shortDescription,
    description:
      input.description !== undefined
        ? emptyToNull(input.description)
        : existing?.description,
    brand:
      input.brand !== undefined ? emptyToNull(input.brand) : existing?.brand,
    metaTitle:
      input.metaTitle !== undefined
        ? emptyToNull(input.metaTitle)
        : existing?.metaTitle,
    metaDescription:
      input.metaDescription !== undefined
        ? emptyToNull(input.metaDescription)
        : existing?.metaDescription,
    metaKeywords:
      input.metaKeywords !== undefined
        ? emptyToNull(input.metaKeywords)
        : existing?.metaKeywords,
    requiresShipping:
      input.requiresShipping ?? existing?.requiresShipping ?? true,
    isDigital: input.isDigital ?? existing?.isDigital ?? false,
    isActive: input.isActive ?? existing?.isActive ?? true,
  }
}

export const list = os
  .input(adminProductListInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const search = input.search?.trim()
    const searchFilter = search
      ? or(
          like(products.name, `%${search}%`),
          like(products.slug, `%${search}%`),
          like(products.brand, `%${search}%`),
        )
      : undefined

    const [totalResult] = await db
      .select({ value: count() })
      .from(products)
      .where(searchFilter)
    const total = totalResult?.value ?? 0
    const pageCount = Math.ceil(total / input.pageSize)
    const offset = input.pageIndex * input.pageSize

    const rows = await db
      .select()
      .from(products)
      .where(searchFilter)
      .orderBy(desc(products.createdAt))
      .limit(input.pageSize)
      .offset(offset)

    const items = await Promise.all(
      rows.map(async (row) => {
        const [variantResult] = await db
          .select({ value: count() })
          .from(productVariants)
          .where(eq(productVariants.productId, row.id))

        const [cover] = await db
          .select({ path: productImages.path })
          .from(productImages)
          .where(eq(productImages.productId, row.id))
          .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))
          .limit(1)

        return adminProductListItemSchema.parse({
          id: row.id,
          productType: row.productType,
          status: row.status,
          name: row.name,
          slug: row.slug,
          brandId: row.brandId ?? null,
          brand: row.brand ?? null,
          requiresShipping: row.requiresShipping,
          isDigital: row.isDigital,
          isActive: row.isActive,
          variantCount: variantResult?.value ?? 0,
          imagePath: cover?.path ?? null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })
      }),
    )

    return adminProductListSchema.parse({
      items,
      pageIndex: input.pageIndex,
      pageSize: input.pageSize,
      total,
      pageCount,
    })
  })

export const get = os
  .input(adminProductIdSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const detail = await loadProductDetail(input.id)

    if (!detail) {
      throw new ORPCError('NOT_FOUND', { message: 'Product not found.' })
    }

    return detail
  })

export const create = os
  .input(adminProductInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const baseSlug = input.slug ?? slugify(input.name)
    const slug = await uniqueSlug(baseSlug || 'product')
    const patch = productPatchFromInput(input)

    const [row] = await db
      .insert(products)
      .values({
        productType: patch.productType,
        status: patch.status,
        name: input.name,
        slug,
        brandId: patch.brandId ?? null,
        shortDescription: patch.shortDescription ?? null,
        description: patch.description ?? null,
        brand: patch.brand ?? null,
        metaTitle: patch.metaTitle ?? null,
        metaDescription: patch.metaDescription ?? null,
        metaKeywords: patch.metaKeywords ?? null,
        requiresShipping: patch.requiresShipping ?? true,
        isDigital: patch.isDigital ?? false,
        isActive: patch.isActive ?? true,
      })
      .returning()

    await replaceProductCategories(row!.id, input.categoryIds)

    const detail = await loadProductDetail(row!.id)
    return detail!
  })

export const update = os
  .input(
    adminProductIdSchema.extend({
      data: adminProductInputSchema.partial(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.id))
      .limit(1)

    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Product not found.' })
    }

    let slug = existing.slug
    if (input.data.slug && input.data.slug !== existing.slug) {
      slug = await uniqueSlug(input.data.slug, input.id)
    }

    const patch = productPatchFromInput(input.data, existing)

    await db
      .update(products)
      .set({
        productType: patch.productType,
        status: patch.status,
        name: input.data.name ?? existing.name,
        slug,
        brandId: patch.brandId,
        shortDescription: patch.shortDescription,
        description: patch.description,
        brand: patch.brand,
        metaTitle: patch.metaTitle,
        metaDescription: patch.metaDescription,
        metaKeywords: patch.metaKeywords,
        requiresShipping: patch.requiresShipping,
        isDigital: patch.isDigital,
        isActive: patch.isActive,
      })
      .where(eq(products.id, input.id))

    await replaceProductCategories(input.id, input.data.categoryIds)

    const detail = await loadProductDetail(input.id)
    return detail!
  })

export const saveVariants = os
  .input(saveProductVariantsInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, input.productId))
      .limit(1)

    if (!product) {
      throw new ORPCError('NOT_FOUND', { message: 'Product not found.' })
    }

    const skus = input.variants.map(v => v.sku)
    if (new Set(skus).size !== skus.length) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Each variant must have a unique SKU.',
      })
    }

    const keptIds = input.variants
      .map(v => v.id)
      .filter((id): id is string => Boolean(id))

    if (keptIds.length > 0) {
      await db.delete(productVariants).where(
        and(
          eq(productVariants.productId, input.productId),
          notInArray(productVariants.id, keptIds),
        ),
      )
    }
    else {
      await db
        .delete(productVariants)
        .where(eq(productVariants.productId, input.productId))
    }

    for (const variant of input.variants) {
      const values = {
        productId: input.productId,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        priceInRials: variant.priceInRials,
        compareAtPriceInRials: variant.compareAtPriceInRials ?? null,
        stockQuantity: variant.stockQuantity,
        isActive: variant.isActive,
      }

      if (variant.id) {
        await db
          .update(productVariants)
          .set(values)
          .where(eq(productVariants.id, variant.id))
      }
      else {
        await db.insert(productVariants).values(values)
      }
    }

    const detail = await loadProductDetail(input.productId)
    return detail!
  })

export const remove = os
  .input(adminProductIdSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, input.id))

    for (const image of images) {
      await deleteProductImageFile(image.path)
    }

    const [row] = await db
      .delete(products)
      .where(eq(products.id, input.id))
      .returning({ id: products.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Product not found.' })
    }

    return { id: row.id }
  })
