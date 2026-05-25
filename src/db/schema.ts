import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'

import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { USER_ROLES } from '#/lib/roles'

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date()),
}

export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' })
      .notNull()
      .default(false),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
    phoneNumber: text('phone_number').unique(),
    phoneNumberVerified: integer('phone_number_verified', {
      mode: 'boolean',
    }),
    role: text('role', { enum: USER_ROLES }).notNull().default('user'),
    gender: text('gender', { enum: ['male', 'female', 'other'] }),
    birthday: integer('birthday', { mode: 'timestamp_ms' }),
  },
  table => [
    uniqueIndex('user_phone_number_uidx').on(table.phoneNumber),
  ],
)

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  table => [
    index('session_user_id_idx').on(table.userId),
    uniqueIndex('session_token_uidx').on(table.token),
  ],
)

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  table => [index('account_user_id_idx').on(table.userId)],
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  table => [index('verification_identifier_idx').on(table.identifier)],
)

/**
 * Saved delivery addresses (Iran: استان، شهر، کد پستی، پلاک، واحد).
 * Recipient phone/name may differ from the account holder — couriers call the recipient.
 */
export const addresses = sqliteTable(
  'addresses',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    label: text('label', { enum: ['home', 'work', 'other'] })
      .notNull()
      .default('home'),
    recipientName: text('recipient_name').notNull(),
    recipientPhone: text('recipient_phone').notNull(),
    province: text('province').notNull(),
    city: text('city').notNull(),
    district: text('district'),
    streetAddress: text('street_address').notNull(),
    plateNumber: text('plate_number'),
    unit: text('unit'),
    postalCode: text('postal_code').notNull(),
    nationalCode: text('national_code'),
    isDefault: integer('is_default', { mode: 'boolean' })
      .notNull()
      .default(false),
    ...timestamps,
  },
  table => [
    index('addresses_user_id_idx').on(table.userId),
    index('addresses_user_default_idx').on(table.userId, table.isDefault),
  ],
)

export const brands = sqliteTable(
  'brands',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    logoMediaId: text('logo_media_id'),
    websiteUrl: text('website_url'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('brands_slug_idx').on(table.slug),
    index('brands_active_idx').on(table.isActive),
  ],
)

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    parentId: text('parent_id').references((): AnySQLiteColumn => categories.id, {
      onDelete: 'set null',
    }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('categories_parent_id_idx').on(table.parentId),
    index('categories_slug_idx').on(table.slug),
    index('categories_active_sort_idx').on(table.isActive, table.sortOrder),
  ],
)

export const categoryClosure = sqliteTable(
  'category_closure',
  {
    ancestorId: text('ancestor_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    descendantId: text('descendant_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    depth: integer('depth').notNull(),
  },
  table => [
    primaryKey({ columns: [table.ancestorId, table.descendantId] }),
    index('category_closure_descendant_idx').on(table.descendantId),
  ],
)

export const collections = sqliteTable(
  'collections',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type', { enum: ['manual', 'smart'] }).notNull().default('manual'),
    rulesJson: text('rules_json'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('collections_slug_idx').on(table.slug),
    index('collections_active_idx').on(table.isActive),
  ],
)

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: text('type', { enum: ['tag', 'label'] }).notNull().default('tag'),
    color: text('color'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('tags_slug_idx').on(table.slug),
    index('tags_type_idx').on(table.type),
  ],
)

export const attributes = sqliteTable(
  'attributes',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    type: text('type', {
      enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'color', 'date'],
    })
      .notNull()
      .default('text'),
    scope: text('scope', { enum: ['product', 'variant', 'both'] })
      .notNull()
      .default('product'),
    unit: text('unit'),
    isFilterable: integer('is_filterable', { mode: 'boolean' })
      .notNull()
      .default(false),
    isVariantOption: integer('is_variant_option', { mode: 'boolean' })
      .notNull()
      .default(false),
    isRequired: integer('is_required', { mode: 'boolean' })
      .notNull()
      .default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  table => [
    index('attributes_code_idx').on(table.code),
    index('attributes_filterable_idx').on(table.isFilterable),
    index('attributes_variant_option_idx').on(table.isVariantOption),
  ],
)

export const attributeValues = sqliteTable(
  'attribute_values',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    attributeId: text('attribute_id')
      .notNull()
      .references(() => attributes.id, { onDelete: 'cascade' }),
    value: text('value').notNull(),
    slug: text('slug'),
    colorHex: text('color_hex'),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  table => [
    index('attribute_values_attribute_id_idx').on(table.attributeId),
    uniqueIndex('attribute_values_attribute_slug_uidx').on(
      table.attributeId,
      table.slug,
    ),
  ],
)

export const mediaAssets = sqliteTable(
  'media_assets',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    type: text('type', { enum: ['image', 'video', 'file'] }).notNull(),
    url: text('url').notNull(),
    alt: text('alt'),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    width: integer('width'),
    height: integer('height'),
    metadataJson: text('metadata_json'),
    ...timestamps,
  },
  table => [
    index('media_assets_type_idx').on(table.type),
    index('media_assets_url_idx').on(table.url),
  ],
)

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productType: text('product_type', {
      enum: ['simple', 'variable', 'bundle', 'digital', 'subscription', 'service'],
    })
      .notNull()
      .default('simple'),
    status: text('status', { enum: ['draft', 'active', 'archived'] })
      .notNull()
      .default('active'),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    shortDescription: text('short_description'),
    description: text('description'),
    brandId: text('brand_id').references(() => brands.id, {
      onDelete: 'set null',
    }),
    /** Legacy denormalized brand label kept while existing admin/product APIs migrate. */
    brand: text('brand'),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    metaKeywords: text('meta_keywords'),
    requiresShipping: integer('requires_shipping', { mode: 'boolean' })
      .notNull()
      .default(true),
    isDigital: integer('is_digital', { mode: 'boolean' }).notNull().default(false),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('products_slug_idx').on(table.slug),
    index('products_brand_id_idx').on(table.brandId),
    index('products_type_status_idx').on(table.productType, table.status),
  ],
)

export const productCategories = sqliteTable(
  'product_categories',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  table => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index('product_categories_category_id_idx').on(table.categoryId),
  ],
)

export const collectionProducts = sqliteTable(
  'collection_products',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  table => [
    primaryKey({ columns: [table.collectionId, table.productId] }),
    index('collection_products_product_id_idx').on(table.productId),
  ],
)

export const productTags = sqliteTable(
  'product_tags',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  table => [
    primaryKey({ columns: [table.productId, table.tagId] }),
    index('product_tags_tag_id_idx').on(table.tagId),
  ],
)

export const productAttributeValues = sqliteTable(
  'product_attribute_values',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    attributeId: text('attribute_id')
      .notNull()
      .references(() => attributes.id, { onDelete: 'cascade' }),
    attributeValueId: text('attribute_value_id').references(
      () => attributeValues.id,
      { onDelete: 'set null' },
    ),
    valueText: text('value_text'),
    valueNumber: integer('value_number'),
    valueBoolean: integer('value_boolean', { mode: 'boolean' }),
    valueJson: text('value_json'),
    ...timestamps,
  },
  table => [
    index('product_attribute_values_product_id_idx').on(table.productId),
    index('product_attribute_values_attribute_id_idx').on(table.attributeId),
    index('product_attribute_values_value_id_idx').on(table.attributeValueId),
  ],
)

export const seoMetadata = sqliteTable(
  'seo_metadata',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    entityType: text('entity_type', {
      enum: ['product', 'category', 'brand', 'collection'],
    }).notNull(),
    entityId: text('entity_id').notNull(),
    title: text('title'),
    description: text('description'),
    keywords: text('keywords'),
    canonicalUrl: text('canonical_url'),
    ogTitle: text('og_title'),
    ogDescription: text('og_description'),
    ogImageMediaId: text('og_image_media_id').references(() => mediaAssets.id, {
      onDelete: 'set null',
    }),
    noindex: integer('noindex', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  table => [
    uniqueIndex('seo_metadata_entity_uidx').on(table.entityType, table.entityId),
    index('seo_metadata_og_image_idx').on(table.ogImageMediaId),
  ],
)

export const translations = sqliteTable(
  'translations',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    entityType: text('entity_type', {
      enum: [
        'product',
        'variant',
        'category',
        'brand',
        'collection',
        'attribute',
        'attribute_value',
      ],
    }).notNull(),
    entityId: text('entity_id').notNull(),
    locale: text('locale').notNull(),
    field: text('field').notNull(),
    value: text('value').notNull(),
    ...timestamps,
  },
  table => [
    uniqueIndex('translations_entity_locale_field_uidx').on(
      table.entityType,
      table.entityId,
      table.locale,
      table.field,
    ),
    index('translations_locale_idx').on(table.locale),
  ],
)

export const productImages = sqliteTable(
  'product_images',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    mediaId: text('media_id').references(() => mediaAssets.id, {
      onDelete: 'set null',
    }),
    /** Public URL path, e.g. /uploads/products/{id}/{file}.webp */
    path: text('path').notNull(),
    alt: text('alt'),
    role: text('role', { enum: ['gallery', 'thumbnail', 'seo', 'attachment'] })
      .notNull()
      .default('gallery'),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  table => [
    index('product_images_product_id_idx').on(table.productId),
    index('product_images_media_id_idx').on(table.mediaId),
    index('product_images_product_sort_idx').on(
      table.productId,
      table.sortOrder,
    ),
  ],
)

/** Size/color stock unit — price in Iranian Rial (integer, no decimals). */
export const productVariants = sqliteTable(
  'product_variants',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull().unique(),
    title: text('title'),
    barcode: text('barcode'),
    size: text('size').notNull(),
    color: text('color').notNull(),
    priceInRials: integer('price_in_rials').notNull(),
    compareAtPriceInRials: integer('compare_at_price_in_rials'),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    defaultMediaId: text('default_media_id').references(() => mediaAssets.id, {
      onDelete: 'set null',
    }),
    weightValue: integer('weight_value'),
    weightUnit: text('weight_unit', { enum: ['g', 'kg', 'lb', 'oz'] }),
    lengthValue: integer('length_value'),
    widthValue: integer('width_value'),
    heightValue: integer('height_value'),
    dimensionUnit: text('dimension_unit', { enum: ['mm', 'cm', 'm', 'in'] }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('product_variants_product_id_idx').on(table.productId),
    index('product_variants_default_media_idx').on(table.defaultMediaId),
    uniqueIndex('product_variants_product_size_color_uidx').on(
      table.productId,
      table.size,
      table.color,
    ),
  ],
)

export const variantAttributeValues = sqliteTable(
  'variant_attribute_values',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    attributeId: text('attribute_id')
      .notNull()
      .references(() => attributes.id, { onDelete: 'cascade' }),
    attributeValueId: text('attribute_value_id').references(
      () => attributeValues.id,
      { onDelete: 'set null' },
    ),
    valueText: text('value_text'),
    valueNumber: integer('value_number'),
    valueBoolean: integer('value_boolean', { mode: 'boolean' }),
    valueJson: text('value_json'),
    ...timestamps,
  },
  table => [
    index('variant_attribute_values_variant_id_idx').on(table.variantId),
    index('variant_attribute_values_attribute_id_idx').on(table.attributeId),
    index('variant_attribute_values_value_id_idx').on(table.attributeValueId),
  ],
)

export const variantMedia = sqliteTable(
  'variant_media',
  {
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    mediaId: text('media_id')
      .notNull()
      .references(() => mediaAssets.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['image', 'gallery'] }).notNull().default('image'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  table => [
    primaryKey({ columns: [table.variantId, table.mediaId] }),
    index('variant_media_media_id_idx').on(table.mediaId),
  ],
)

export const currencies = sqliteTable(
  'currencies',
  {
    code: text('code').primaryKey(),
    name: text('name').notNull(),
    symbol: text('symbol').notNull(),
    decimalDigits: integer('decimal_digits').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  },
)

export const salesChannels = sqliteTable(
  'sales_channels',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    currencyCode: text('currency_code').references(() => currencies.code, {
      onDelete: 'set null',
    }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [index('sales_channels_code_idx').on(table.code)],
)

export const variantPrices = sqliteTable(
  'variant_prices',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    currencyCode: text('currency_code')
      .notNull()
      .references(() => currencies.code, { onDelete: 'restrict' }),
    channelId: text('channel_id').references(() => salesChannels.id, {
      onDelete: 'cascade',
    }),
    priceAmount: integer('price_amount').notNull(),
    compareAtAmount: integer('compare_at_amount'),
    costAmount: integer('cost_amount'),
    startsAt: integer('starts_at', { mode: 'timestamp_ms' }),
    endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  table => [
    index('variant_prices_variant_id_idx').on(table.variantId),
    index('variant_prices_currency_idx').on(table.currencyCode),
    index('variant_prices_channel_idx').on(table.channelId),
  ],
)

export const warehouses = sqliteTable(
  'warehouses',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    country: text('country'),
    province: text('province'),
    city: text('city'),
    address: text('address'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [index('warehouses_code_idx').on(table.code)],
)

export const inventoryItems = sqliteTable(
  'inventory_items',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    warehouseId: text('warehouse_id')
      .notNull()
      .references(() => warehouses.id, { onDelete: 'cascade' }),
    quantityOnHand: integer('quantity_on_hand').notNull().default(0),
    quantityReserved: integer('quantity_reserved').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(0),
    ...timestamps,
  },
  table => [
    uniqueIndex('inventory_items_variant_warehouse_uidx').on(
      table.variantId,
      table.warehouseId,
    ),
    index('inventory_items_warehouse_id_idx').on(table.warehouseId),
  ],
)

export const inventoryMovements = sqliteTable(
  'inventory_movements',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: ['receive', 'sale', 'return', 'adjustment', 'reservation', 'release'],
    }).notNull(),
    quantity: integer('quantity').notNull(),
    reason: text('reason'),
    referenceType: text('reference_type'),
    referenceId: text('reference_id'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  table => [
    index('inventory_movements_item_id_idx').on(table.inventoryItemId),
    index('inventory_movements_reference_idx').on(
      table.referenceType,
      table.referenceId,
    ),
  ],
)

export const bundleItems = sqliteTable(
  'bundle_items',
  {
    bundleProductId: text('bundle_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    childVariantId: text('child_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
  },
  table => [
    primaryKey({ columns: [table.bundleProductId, table.childVariantId] }),
    index('bundle_items_child_variant_idx').on(table.childVariantId),
  ],
)

export const digitalFiles = sqliteTable(
  'digital_files',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id').references(() => products.id, {
      onDelete: 'cascade',
    }),
    variantId: text('variant_id').references(() => productVariants.id, {
      onDelete: 'cascade',
    }),
    mediaId: text('media_id')
      .notNull()
      .references(() => mediaAssets.id, { onDelete: 'cascade' }),
    downloadLimit: integer('download_limit'),
    expiresAfterDays: integer('expires_after_days'),
    ...timestamps,
  },
  table => [
    index('digital_files_product_id_idx').on(table.productId),
    index('digital_files_variant_id_idx').on(table.variantId),
    index('digital_files_media_id_idx').on(table.mediaId),
  ],
)

export const subscriptionPlans = sqliteTable(
  'subscription_plans',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    interval: text('interval', { enum: ['day', 'week', 'month', 'year'] })
      .notNull()
      .default('month'),
    intervalCount: integer('interval_count').notNull().default(1),
    trialDays: integer('trial_days'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [index('subscription_plans_product_id_idx').on(table.productId)],
)

export const shippingMethods = sqliteTable(
  'shipping_methods',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    carrier: text('carrier'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [index('shipping_methods_code_idx').on(table.code)],
)

export const shippingZones = sqliteTable(
  'shipping_zones',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    countriesJson: text('countries_json'),
    provincesJson: text('provinces_json'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
)

export const shippingRates = sqliteTable(
  'shipping_rates',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    zoneId: text('zone_id')
      .notNull()
      .references(() => shippingZones.id, { onDelete: 'cascade' }),
    methodId: text('method_id')
      .notNull()
      .references(() => shippingMethods.id, { onDelete: 'cascade' }),
    currencyCode: text('currency_code')
      .notNull()
      .references(() => currencies.code, { onDelete: 'restrict' }),
    minWeight: integer('min_weight'),
    maxWeight: integer('max_weight'),
    minOrderAmount: integer('min_order_amount'),
    priceAmount: integer('price_amount').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('shipping_rates_zone_id_idx').on(table.zoneId),
    index('shipping_rates_method_id_idx').on(table.methodId),
  ],
)

export const cartItems = sqliteTable(
  'cart_items',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    ...timestamps,
  },
  table => [
    unique('cart_items_user_variant_uidx').on(
      table.userId,
      table.productVariantId,
    ),
    index('cart_items_user_id_idx').on(table.userId),
  ],
)

/**
 * Checkout captures a shipping snapshot so edits to saved addresses do not change past orders.
 * `paymentMethod: cod` = پرداخت در محل (common in Iran).
 */
export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    orderNumber: text('order_number').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    status: text('status', {
      enum: [
        'pending_payment',
        'paid',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
    })
      .notNull()
      .default('pending_payment'),
    paymentMethod: text('payment_method', {
      enum: ['online', 'cod'],
    }).notNull(),
    paymentStatus: text('payment_status', {
      enum: ['pending', 'paid', 'failed', 'refunded'],
    })
      .notNull()
      .default('pending'),
    shippingAddressId: text('shipping_address_id').references(() => addresses.id, {
      onDelete: 'set null',
    }),
    shippingRecipientName: text('shipping_recipient_name').notNull(),
    shippingRecipientPhone: text('shipping_recipient_phone').notNull(),
    shippingProvince: text('shipping_province').notNull(),
    shippingCity: text('shipping_city').notNull(),
    shippingDistrict: text('shipping_district'),
    shippingStreetAddress: text('shipping_street_address').notNull(),
    shippingPlateNumber: text('shipping_plate_number'),
    shippingUnit: text('shipping_unit'),
    shippingPostalCode: text('shipping_postal_code').notNull(),
    shippingNationalCode: text('shipping_national_code'),
    customerNote: text('customer_note'),
    subtotalInRials: integer('subtotal_in_rials').notNull(),
    shippingCostInRials: integer('shipping_cost_in_rials').notNull().default(0),
    discountInRials: integer('discount_in_rials').notNull().default(0),
    totalInRials: integer('total_in_rials').notNull(),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
    shippedAt: integer('shipped_at', { mode: 'timestamp_ms' }),
    deliveredAt: integer('delivered_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  table => [
    index('orders_user_id_idx').on(table.userId),
    uniqueIndex('orders_order_number_uidx').on(table.orderNumber),
    index('orders_status_idx').on(table.status),
  ],
)

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id').references(
      () => productVariants.id,
      { onDelete: 'set null' },
    ),
    productName: text('product_name').notNull(),
    brand: text('brand'),
    size: text('size').notNull(),
    color: text('color').notNull(),
    sku: text('sku').notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceInRials: integer('unit_price_in_rials').notNull(),
    lineTotalInRials: integer('line_total_in_rials').notNull(),
    ...timestamps,
  },
  table => [index('order_items_order_id_idx').on(table.orderId)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  addresses: many(addresses),
  cartItems: many(cartItems),
  orders: many(orders),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const addressRelations = relations(addresses, ({ one, many }) => ({
  user: one(user, {
    fields: [addresses.userId],
    references: [user.id],
  }),
  orders: many(orders),
}))

export const brandRelations = relations(brands, ({ many }) => ({
  products: many(products),
}))

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  productCategories: many(productCategories),
}))

export const categoryClosureRelations = relations(categoryClosure, ({ one }) => ({
  ancestor: one(categories, {
    fields: [categoryClosure.ancestorId],
    references: [categories.id],
  }),
  descendant: one(categories, {
    fields: [categoryClosure.descendantId],
    references: [categories.id],
  }),
}))

export const collectionRelations = relations(collections, ({ many }) => ({
  products: many(collectionProducts),
}))

export const tagRelations = relations(tags, ({ many }) => ({
  products: many(productTags),
}))

export const attributeRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
  productValues: many(productAttributeValues),
  variantValues: many(variantAttributeValues),
}))

export const attributeValueRelations = relations(attributeValues, ({ one, many }) => ({
  attribute: one(attributes, {
    fields: [attributeValues.attributeId],
    references: [attributes.id],
  }),
  productValues: many(productAttributeValues),
  variantValues: many(variantAttributeValues),
}))

export const mediaAssetRelations = relations(mediaAssets, ({ many }) => ({
  productImages: many(productImages),
  variantMedia: many(variantMedia),
  digitalFiles: many(digitalFiles),
}))

export const productRelations = relations(products, ({ one, many }) => ({
  brandRecord: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  categories: many(productCategories),
  collections: many(collectionProducts),
  tags: many(productTags),
  attributeValues: many(productAttributeValues),
  bundleItems: many(bundleItems),
  digitalFiles: many(digitalFiles),
  subscriptionPlans: many(subscriptionPlans),
}))

export const productCategoryRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}))

export const collectionProductRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionProducts.collectionId],
    references: [collections.id],
  }),
  product: one(products, {
    fields: [collectionProducts.productId],
    references: [products.id],
  }),
}))

export const productTagRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}))

export const productAttributeValueRelations = relations(
  productAttributeValues,
  ({ one }) => ({
    product: one(products, {
      fields: [productAttributeValues.productId],
      references: [products.id],
    }),
    attribute: one(attributes, {
      fields: [productAttributeValues.attributeId],
      references: [attributes.id],
    }),
    attributeValue: one(attributeValues, {
      fields: [productAttributeValues.attributeValueId],
      references: [attributeValues.id],
    }),
  }),
)

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  media: one(mediaAssets, {
    fields: [productImages.mediaId],
    references: [mediaAssets.id],
  }),
}))

export const productVariantRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    defaultMedia: one(mediaAssets, {
      fields: [productVariants.defaultMediaId],
      references: [mediaAssets.id],
    }),
    attributeValues: many(variantAttributeValues),
    media: many(variantMedia),
    prices: many(variantPrices),
    inventoryItems: many(inventoryItems),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
  }),
)

export const variantAttributeValueRelations = relations(
  variantAttributeValues,
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [variantAttributeValues.variantId],
      references: [productVariants.id],
    }),
    attribute: one(attributes, {
      fields: [variantAttributeValues.attributeId],
      references: [attributes.id],
    }),
    attributeValue: one(attributeValues, {
      fields: [variantAttributeValues.attributeValueId],
      references: [attributeValues.id],
    }),
  }),
)

export const variantMediaRelations = relations(variantMedia, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantMedia.variantId],
    references: [productVariants.id],
  }),
  media: one(mediaAssets, {
    fields: [variantMedia.mediaId],
    references: [mediaAssets.id],
  }),
}))

export const currencyRelations = relations(currencies, ({ many }) => ({
  prices: many(variantPrices),
  channels: many(salesChannels),
  shippingRates: many(shippingRates),
}))

export const salesChannelRelations = relations(salesChannels, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [salesChannels.currencyCode],
    references: [currencies.code],
  }),
  prices: many(variantPrices),
}))

export const variantPriceRelations = relations(variantPrices, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantPrices.variantId],
    references: [productVariants.id],
  }),
  currency: one(currencies, {
    fields: [variantPrices.currencyCode],
    references: [currencies.code],
  }),
  channel: one(salesChannels, {
    fields: [variantPrices.channelId],
    references: [salesChannels.id],
  }),
}))

export const warehouseRelations = relations(warehouses, ({ many }) => ({
  inventoryItems: many(inventoryItems),
}))

export const inventoryItemRelations = relations(inventoryItems, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [inventoryItems.variantId],
    references: [productVariants.id],
  }),
  warehouse: one(warehouses, {
    fields: [inventoryItems.warehouseId],
    references: [warehouses.id],
  }),
  movements: many(inventoryMovements),
}))

export const inventoryMovementRelations = relations(inventoryMovements, ({ one }) => ({
  inventoryItem: one(inventoryItems, {
    fields: [inventoryMovements.inventoryItemId],
    references: [inventoryItems.id],
  }),
}))

export const bundleItemRelations = relations(bundleItems, ({ one }) => ({
  bundleProduct: one(products, {
    fields: [bundleItems.bundleProductId],
    references: [products.id],
  }),
  childVariant: one(productVariants, {
    fields: [bundleItems.childVariantId],
    references: [productVariants.id],
  }),
}))

export const digitalFileRelations = relations(digitalFiles, ({ one }) => ({
  product: one(products, {
    fields: [digitalFiles.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [digitalFiles.variantId],
    references: [productVariants.id],
  }),
  media: one(mediaAssets, {
    fields: [digitalFiles.mediaId],
    references: [mediaAssets.id],
  }),
}))

export const subscriptionPlanRelations = relations(subscriptionPlans, ({ one }) => ({
  product: one(products, {
    fields: [subscriptionPlans.productId],
    references: [products.id],
  }),
}))

export const shippingMethodRelations = relations(shippingMethods, ({ many }) => ({
  rates: many(shippingRates),
}))

export const shippingZoneRelations = relations(shippingZones, ({ many }) => ({
  rates: many(shippingRates),
}))

export const shippingRateRelations = relations(shippingRates, ({ one }) => ({
  zone: one(shippingZones, {
    fields: [shippingRates.zoneId],
    references: [shippingZones.id],
  }),
  method: one(shippingMethods, {
    fields: [shippingRates.methodId],
    references: [shippingMethods.id],
  }),
  currency: one(currencies, {
    fields: [shippingRates.currencyCode],
    references: [currencies.code],
  }),
}))

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  user: one(user, {
    fields: [cartItems.userId],
    references: [user.id],
  }),
  productVariant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}))

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}))

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}))
