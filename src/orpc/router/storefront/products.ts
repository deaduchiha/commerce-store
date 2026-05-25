import type { OrpcContext } from '#/orpc/context'
import { os } from '@orpc/server'
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  like,
  min,
  or,
} from 'drizzle-orm'

import { db } from '#/db'
import {
  brands,
  categoryClosure,
  productCategories,
  productImages,
  products,
  productTags,
  productVariants,
} from '#/db/schema'
import {
  storefrontProductListInputSchema,
  storefrontProductListItemSchema,
  storefrontProductListSchema,
} from '#/orpc/schemas/storefront/products'

export const list = os
  .input(storefrontProductListInputSchema)
  .handler(async ({ context, input }) => {
    void (context as OrpcContext | undefined)

    const search = input.search?.trim()
    const filters = [
      eq(products.isActive, true),
      eq(products.status, 'active'),
    ]

    if (search) {
      filters.push(
        or(
          like(products.name, `%${search}%`),
          like(products.slug, `%${search}%`),
          exists(
            db
              .select({ id: brands.id })
              .from(brands)
              .where(
                and(
                  eq(brands.id, products.brandId),
                  like(brands.name, `%${search}%`),
                ),
              ),
          ),
        )!,
      )
    }

    if (input.brandId) {
      filters.push(eq(products.brandId, input.brandId))
    }

    if (input.categoryId) {
      filters.push(
        exists(
          db
            .select({ id: categoryClosure.descendantId })
            .from(categoryClosure)
            .innerJoin(
              productCategories,
              eq(productCategories.categoryId, categoryClosure.descendantId),
            )
            .where(
              and(
                eq(categoryClosure.ancestorId, input.categoryId),
                eq(productCategories.productId, products.id),
              ),
            ),
        ),
      )
    }

    if (input.tagId) {
      filters.push(
        exists(
          db
            .select({ id: productTags.productId })
            .from(productTags)
            .where(
              and(
                eq(productTags.productId, products.id),
                eq(productTags.tagId, input.tagId),
              ),
            ),
        ),
      )
    }

    const whereClause = and(...filters)

    const [totalRow] = await db
      .select({ total: count() })
      .from(products)
      .where(whereClause)

    const total = totalRow?.total ?? 0
    const pageCount = total === 0
      ? 0
      : Math.ceil(total / input.pageSize)

    const rows = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(input.pageSize)
      .offset(input.pageIndex * input.pageSize)

    const items = await Promise.all(
      rows.map(async (row) => {
        const [cover] = await db
          .select({ path: productImages.path })
          .from(productImages)
          .where(eq(productImages.productId, row.id))
          .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))
          .limit(1)

        const [priceRow] = await db
          .select({ minPrice: min(productVariants.priceInRials) })
          .from(productVariants)
          .where(
            and(
              eq(productVariants.productId, row.id),
              eq(productVariants.isActive, true),
            ),
          )

        let brandLabel: string | null = null
        if (row.brandId) {
          const [brandRow] = await db
            .select({ name: brands.name })
            .from(brands)
            .where(eq(brands.id, row.brandId))
            .limit(1)
          brandLabel = brandRow?.name ?? null
        }

        return storefrontProductListItemSchema.parse({
          id: row.id,
          name: row.name,
          slug: row.slug,
          brand: brandLabel,
          imagePath: cover?.path ?? null,
          minPriceInRials: priceRow?.minPrice ?? null,
        })
      }),
    )

    return storefrontProductListSchema.parse({
      items,
      pageIndex: input.pageIndex,
      pageSize: input.pageSize,
      total,
      pageCount,
    })
  })
