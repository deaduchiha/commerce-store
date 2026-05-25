# Catalog Module

The catalog module owns brands, categories, attributes, tags, collections, and collection-product assignment.

Current boundary:

- `services/admin-catalog-service.ts` owns database writes, DTO mapping, category closure rebuilds, and catalog not-found errors.
- `src/orpc/router/admin/catalog.ts` is now only an admin auth and input-validation adapter.
- Existing admin UI remains in `src/features/admin/catalog` until the UI folder migration is worth doing.

Next catalog tasks from the roadmap:

- Finish attribute-driven variants as the primary product-variant model.
- Add an admin category tree UX on top of the existing parent/closure data.
- Decide whether smart collections are enabled or hidden until `rulesJson` has an evaluator.
