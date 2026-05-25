# Modules

This folder is the domain boundary introduced by the ecommerce roadmap.

## Rules

- `src/orpc/router/**` stays thin: auth, input schemas, and calls into modules.
- Business rules, writes, DTO mapping, and cross-table consistency live in `src/modules/*/services`.
- UI can stay in `src/features` while modules are introduced gradually; move UI only when a slice is stable.
- Each aggregate should have one write path. For example, catalog mutations go through `modules/catalog/services/admin-catalog-service.ts`.

## Initial Slices

- `catalog`: brands, categories, attributes, tags, collections, collection products.
- `product`: product and variant service extraction comes next.
- `media`: upload pipeline migration to `media_assets`.
- `cart`, `checkout`, `payment`, `order`, `inventory`: Phase 1 commerce runtime.
