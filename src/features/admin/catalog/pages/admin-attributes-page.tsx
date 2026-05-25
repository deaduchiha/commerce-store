import { createAdminCatalogSectionPage } from '../admin-catalog-section-page'
import { AttributesSection } from '../catalog-sections'

export const AdminAttributesPage = createAdminCatalogSectionPage(
  '/dashboard/admin/catalog/attributes',
  AttributesSection,
)
