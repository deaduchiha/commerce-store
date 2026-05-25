import { createAdminCatalogSectionPage } from '../admin-catalog-section-page'
import { CollectionsSection } from '../catalog-sections'

export const AdminCollectionsPage = createAdminCatalogSectionPage(
  '/dashboard/admin/catalog/collections',
  CollectionsSection,
)
