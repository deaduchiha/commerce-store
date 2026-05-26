import type { OrpcContext } from '#/orpc/context'
import { os } from '@orpc/server'

import { adminCatalogService } from '#/modules/catalog/services/admin-catalog-service'
import { requireAdmin } from '#/orpc/lib/require-admin'
import {
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

async function assertAdmin(context: unknown) {
  const { headers } = context as OrpcContext
  await requireAdmin(headers)
}

function adminHandler<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>,
) {
  return async ({ context, input }: { context: unknown, input: TInput }) => {
    await assertAdmin(context)
    return handler(input)
  }
}

export const listBrands = os
  .input(catalogListInputSchema)
  .handler(adminHandler(adminCatalogService.listBrands))

export const createBrand = os
  .input(adminBrandInputSchema)
  .handler(adminHandler(adminCatalogService.createBrand))

export const updateBrand = os
  .input(catalogIdSchema.extend({ data: adminBrandInputSchema.partial() }))
  .handler(adminHandler(adminCatalogService.updateBrand))

export const deleteBrand = os
  .input(catalogIdSchema)
  .handler(adminHandler(adminCatalogService.deleteBrand))

export const listCategories = os
  .input(catalogListInputSchema)
  .handler(adminHandler(adminCatalogService.listCategories))

export const createCategory = os
  .input(adminCategoryInputSchema)
  .handler(adminHandler(adminCatalogService.createCategory))

export const updateCategory = os
  .input(catalogIdSchema.extend({ data: adminCategoryInputSchema.partial() }))
  .handler(adminHandler(adminCatalogService.updateCategory))

export const deleteCategory = os
  .input(catalogIdSchema)
  .handler(adminHandler(adminCatalogService.deleteCategory))

export const reorderCategories = os
  .input(adminCategoryReorderSchema)
  .handler(adminHandler(adminCatalogService.reorderCategories))

export const listAttributes = os
  .input(catalogListInputSchema)
  .handler(adminHandler(adminCatalogService.listAttributes))

export const createAttribute = os
  .input(adminAttributeInputSchema)
  .handler(adminHandler(adminCatalogService.createAttribute))

export const updateAttribute = os
  .input(catalogIdSchema.extend({ data: adminAttributeInputSchema.partial() }))
  .handler(adminHandler(adminCatalogService.updateAttribute))

export const deleteAttribute = os
  .input(catalogIdSchema)
  .handler(adminHandler(adminCatalogService.deleteAttribute))

export const listCollections = os
  .input(catalogListInputSchema)
  .handler(adminHandler(adminCatalogService.listCollections))

export const createCollection = os
  .input(adminCollectionInputSchema)
  .handler(adminHandler(adminCatalogService.createCollection))

export const updateCollection = os
  .input(catalogIdSchema.extend({ data: adminCollectionInputSchema.partial() }))
  .handler(adminHandler(adminCatalogService.updateCollection))

export const deleteCollection = os
  .input(catalogIdSchema)
  .handler(adminHandler(adminCatalogService.deleteCollection))

export const listTags = os
  .input(catalogListInputSchema)
  .handler(adminHandler(adminCatalogService.listTags))

export const createTag = os
  .input(adminTagInputSchema)
  .handler(adminHandler(adminCatalogService.createTag))

export const updateTag = os
  .input(catalogIdSchema.extend({ data: adminTagInputSchema.partial() }))
  .handler(adminHandler(adminCatalogService.updateTag))

export const deleteTag = os
  .input(catalogIdSchema)
  .handler(adminHandler(adminCatalogService.deleteTag))

export const listCollectionProducts = os
  .input(adminCollectionProductsInputSchema)
  .handler(adminHandler(adminCatalogService.listCollectionProducts))

export const setCollectionProducts = os
  .input(adminCollectionProductsUpdateSchema)
  .handler(adminHandler(adminCatalogService.setCollectionProducts))
