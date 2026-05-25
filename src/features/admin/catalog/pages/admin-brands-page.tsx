import { createAdminCatalogSectionPage } from '../admin-catalog-section-page'
import { BrandsSection } from '../catalog-sections'

export const AdminBrandsPage = createAdminCatalogSectionPage(
  '/dashboard/admin/catalog/brands',
  BrandsSection,
)
