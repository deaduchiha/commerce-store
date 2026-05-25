import type { QueryClient } from '@tanstack/react-query'

import { orpc } from '#/orpc/client'

export async function invalidateCatalogProductQueries(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: orpc.admin.catalog.listBrands.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.admin.catalog.listCategories.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.admin.catalog.listAttributes.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.admin.catalog.listCollections.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.admin.catalog.listTags.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.admin.products.list.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.admin.products.get.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.storefront.products.list.key(),
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.storefront.catalog.filterOptions.key(),
    }),
  ])
}
