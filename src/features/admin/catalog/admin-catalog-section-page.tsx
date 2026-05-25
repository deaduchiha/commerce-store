import type { ComponentType } from 'react'
import type { AdminCatalogNavTo } from '#/lib/admin-catalog-nav'

import { CatalogPageLayout } from '#/components/admin/catalog/catalog-page-layout'
import { getAdminCatalogNavItem } from '#/lib/admin-catalog-nav'

export function createAdminCatalogSectionPage(
  to: AdminCatalogNavTo,
  Section: ComponentType,
) {
  const section = getAdminCatalogNavItem(to)

  return function AdminCatalogSectionPage() {
    return (
      <CatalogPageLayout
        section={section}
        searchPlaceholder={section.searchPlaceholder}
      >
        <Section />
      </CatalogPageLayout>
    )
  }
}
