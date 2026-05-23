import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'
import { count, desc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { products, productVariants } from '#/db/schema'
import { slugify } from '#/lib/slug'
import { requireAdmin } from '#/orpc/lib/require-admin'
import {
  adminProductIdSchema,
  adminProductInputSchema,
  adminProductSchema,
} from '#/orpc/schemas/admin/products'

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || null
}

function toAdminProduct(
  row: typeof products.$inferSelect,
  variantCount: number,
) {
  return adminProductSchema.parse({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    brand: row.brand ?? null,
    isActive: row.isActive,
    variantCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  })
}

async function uniqueSlug(base: string) {
  let slug = base
  let suffix = 0

  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1)

    if (!existing) {
      return slug
    }

    suffix += 1
    slug = `${base}-${suffix}`
  }
}

async function getVariantCount(productId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(productVariants)
    .where(eq(productVariants.productId, productId))

  return result?.value ?? 0
}

export const list = os.handler(async ({ context }) => {
  const { headers } = context as OrpcContext
  await requireAdmin(headers)

  const rows = await db.select().from(products).orderBy(desc(products.createdAt))

  return Promise.all(
    rows.map(async row =>
      toAdminProduct(row, await getVariantCount(row.id)),
    ),
  )
})

export const get = os
  .input(adminProductIdSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.id))
      .limit(1)

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Product not found.' })
    }

    return toAdminProduct(row, await getVariantCount(row.id))
  })

export const create = os
  .input(adminProductInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const baseSlug = input.slug ?? slugify(input.name)
    const slug = await uniqueSlug(baseSlug || 'product')

    const [row] = await db
      .insert(products)
      .values({
        name: input.name,
        slug,
        description: emptyToNull(input.description),
        brand: emptyToNull(input.brand),
        isActive: input.isActive ?? true,
      })
      .returning()

    return toAdminProduct(row!, 0)
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
      slug = await uniqueSlug(input.data.slug)
    }

    const [row] = await db
      .update(products)
      .set({
        name: input.data.name ?? existing.name,
        slug,
        description:
          input.data.description !== undefined
            ? emptyToNull(input.data.description)
            : existing.description,
        brand:
          input.data.brand !== undefined
            ? emptyToNull(input.data.brand)
            : existing.brand,
        isActive: input.data.isActive ?? existing.isActive,
      })
      .where(eq(products.id, input.id))
      .returning()

    return toAdminProduct(row!, await getVariantCount(input.id))
  })

export const remove = os
  .input(adminProductIdSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    await requireAdmin(headers)

    const [row] = await db
      .delete(products)
      .where(eq(products.id, input.id))
      .returning({ id: products.id })

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Product not found.' })
    }

    return { id: row.id }
  })
