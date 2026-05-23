import { createFileRoute } from '@tanstack/react-router'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { productImages, products } from '#/db/schema'
import {
  deleteProductImageFile,
  saveProductImageFile,
} from '#/lib/uploads/product-images'
import { requireAdminRequest } from '#/lib/uploads/require-admin-request'

export const Route = createFileRoute('/api/admin/products/$productId/images')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const auth = await requireAdminRequest(request)
        if (auth.error) {
          return auth.error
        }

        const { productId } = params

        const [product] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.id, productId))
          .limit(1)

        if (!product) {
          return Response.json({ message: 'Product not found' }, { status: 404 })
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!(file instanceof File)) {
          return Response.json({ message: 'No file provided' }, { status: 400 })
        }

        try {
          const saved = await saveProductImageFile(productId, file)
          const alt = formData.get('alt')
          const altText
            = typeof alt === 'string' && alt.trim() ? alt.trim() : null

          const [last] = await db
            .select({ sortOrder: productImages.sortOrder })
            .from(productImages)
            .where(eq(productImages.productId, productId))
            .orderBy(desc(productImages.sortOrder))
            .limit(1)

          const sortOrder = (last?.sortOrder ?? -1) + 1

          const [row] = await db
            .insert(productImages)
            .values({
              productId,
              path: saved.path,
              alt: altText,
              sortOrder,
            })
            .returning()

          return Response.json({
            id: row!.id,
            productId: row!.productId,
            path: row!.path,
            alt: row!.alt,
            sortOrder: row!.sortOrder,
            createdAt: row!.createdAt.toISOString(),
          })
        }
        catch (error) {
          const message
            = error instanceof Error ? error.message : 'Upload failed'
          return Response.json({ message }, { status: 400 })
        }
      },

      DELETE: async ({ request, params }) => {
        const auth = await requireAdminRequest(request)
        if (auth.error) {
          return auth.error
        }

        const { productId } = params
        const body = (await request.json()) as { imageId?: string }

        if (!body.imageId) {
          return Response.json({ message: 'imageId required' }, { status: 400 })
        }

        const [image] = await db
          .select()
          .from(productImages)
          .where(eq(productImages.id, body.imageId))
          .limit(1)

        if (!image || image.productId !== productId) {
          return Response.json({ message: 'Image not found' }, { status: 404 })
        }

        await deleteProductImageFile(image.path)
        await db.delete(productImages).where(eq(productImages.id, image.id))

        return Response.json({ id: image.id })
      },
    },
  },
})
