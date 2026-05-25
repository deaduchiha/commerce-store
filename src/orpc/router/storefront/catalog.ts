import type { OrpcContext } from '#/orpc/context'
import { os } from '@orpc/server'
import { asc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { brands, categories, tags } from '#/db/schema'
import { storefrontCatalogFiltersSchema } from '#/orpc/schemas/storefront/catalog'

export const filterOptions = os.handler(async ({ context }) => {
  void (context as OrpcContext | undefined)

  const [brandRows, categoryRows, tagRows] = await Promise.all([
    db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
      })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(asc(brands.name)),
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .where(eq(tags.isActive, true))
      .orderBy(asc(tags.name)),
  ])

  return storefrontCatalogFiltersSchema.parse({
    brands: brandRows,
    categories: categoryRows.map(row => ({
      ...row,
      parentId: row.parentId ?? null,
    })),
    tags: tagRows,
  })
})
