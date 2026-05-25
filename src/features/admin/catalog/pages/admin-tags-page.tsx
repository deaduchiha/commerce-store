import { createAdminCatalogSectionPage } from '../admin-catalog-section-page'
import { TagsSection } from '../catalog-sections'

export const AdminTagsPage = createAdminCatalogSectionPage(
  '/dashboard/admin/catalog/tags',
  TagsSection,
)
