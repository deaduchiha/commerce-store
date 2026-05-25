import { createAdminCatalogSectionPage } from '../admin-catalog-section-page'
import { CategoriesSection } from '../catalog-sections'

export const AdminCategoriesPage = createAdminCatalogSectionPage(
  '/dashboard/admin/catalog/categories',
  CategoriesSection,
)
