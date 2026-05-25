CREATE TABLE `attribute_values` (
	`id` text PRIMARY KEY NOT NULL,
	`attribute_id` text NOT NULL,
	`value` text NOT NULL,
	`slug` text,
	`color_hex` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attribute_values_attribute_id_idx` ON `attribute_values` (`attribute_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `attribute_values_attribute_slug_uidx` ON `attribute_values` (`attribute_id`,`slug`);--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`scope` text DEFAULT 'product' NOT NULL,
	`unit` text,
	`is_filterable` integer DEFAULT false NOT NULL,
	`is_variant_option` integer DEFAULT false NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attributes_code_unique` ON `attributes` (`code`);--> statement-breakpoint
CREATE INDEX `attributes_code_idx` ON `attributes` (`code`);--> statement-breakpoint
CREATE INDEX `attributes_filterable_idx` ON `attributes` (`is_filterable`);--> statement-breakpoint
CREATE INDEX `attributes_variant_option_idx` ON `attributes` (`is_variant_option`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`logo_media_id` text,
	`website_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE INDEX `brands_slug_idx` ON `brands` (`slug`);--> statement-breakpoint
CREATE INDEX `brands_active_idx` ON `brands` (`is_active`);--> statement-breakpoint
CREATE TABLE `bundle_items` (
	`bundle_product_id` text NOT NULL,
	`child_variant_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`bundle_product_id`, `child_variant_id`),
	FOREIGN KEY (`bundle_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`child_variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `bundle_items_child_variant_idx` ON `bundle_items` (`child_variant_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_active_sort_idx` ON `categories` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `category_closure` (
	`ancestor_id` text NOT NULL,
	`descendant_id` text NOT NULL,
	`depth` integer NOT NULL,
	PRIMARY KEY(`ancestor_id`, `descendant_id`),
	FOREIGN KEY (`ancestor_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`descendant_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `category_closure_descendant_idx` ON `category_closure` (`descendant_id`);--> statement-breakpoint
CREATE TABLE `collection_products` (
	`collection_id` text NOT NULL,
	`product_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`collection_id`, `product_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `collection_products_product_id_idx` ON `collection_products` (`product_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'manual' NOT NULL,
	`rules_json` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_slug_unique` ON `collections` (`slug`);--> statement-breakpoint
CREATE INDEX `collections_slug_idx` ON `collections` (`slug`);--> statement-breakpoint
CREATE INDEX `collections_active_idx` ON `collections` (`is_active`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`decimal_digits` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `digital_files` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`variant_id` text,
	`media_id` text NOT NULL,
	`download_limit` integer,
	`expires_after_days` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `digital_files_product_id_idx` ON `digital_files` (`product_id`);--> statement-breakpoint
CREATE INDEX `digital_files_variant_id_idx` ON `digital_files` (`variant_id`);--> statement-breakpoint
CREATE INDEX `digital_files_media_id_idx` ON `digital_files` (`media_id`);--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`warehouse_id` text NOT NULL,
	`quantity_on_hand` integer DEFAULT 0 NOT NULL,
	`quantity_reserved` integer DEFAULT 0 NOT NULL,
	`low_stock_threshold` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_items_variant_warehouse_uidx` ON `inventory_items` (`variant_id`,`warehouse_id`);--> statement-breakpoint
CREATE INDEX `inventory_items_warehouse_id_idx` ON `inventory_items` (`warehouse_id`);--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_item_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text,
	`reference_type` text,
	`reference_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inventory_movements_item_id_idx` ON `inventory_movements` (`inventory_item_id`);--> statement-breakpoint
CREATE INDEX `inventory_movements_reference_idx` ON `inventory_movements` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`mime_type` text,
	`size_bytes` integer,
	`width` integer,
	`height` integer,
	`metadata_json` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_assets_type_idx` ON `media_assets` (`type`);--> statement-breakpoint
CREATE INDEX `media_assets_url_idx` ON `media_assets` (`url`);--> statement-breakpoint
CREATE TABLE `product_attribute_values` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`attribute_id` text NOT NULL,
	`attribute_value_id` text,
	`value_text` text,
	`value_number` integer,
	`value_boolean` integer,
	`value_json` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `product_attribute_values_product_id_idx` ON `product_attribute_values` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_attribute_values_attribute_id_idx` ON `product_attribute_values` (`attribute_id`);--> statement-breakpoint
CREATE INDEX `product_attribute_values_value_id_idx` ON `product_attribute_values` (`attribute_value_id`);--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` text NOT NULL,
	`category_id` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`product_id`, `category_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_categories_category_id_idx` ON `product_categories` (`category_id`);--> statement-breakpoint
ALTER TABLE `product_images` ADD `media_id` text REFERENCES media_assets(id);--> statement-breakpoint
ALTER TABLE `product_images` ADD `role` text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
CREATE INDEX `product_images_media_id_idx` ON `product_images` (`media_id`);--> statement-breakpoint
CREATE TABLE `product_tags` (
	`product_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`product_id`, `tag_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_tags_tag_id_idx` ON `product_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `sales_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`currency_code` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_channels_code_unique` ON `sales_channels` (`code`);--> statement-breakpoint
CREATE INDEX `sales_channels_code_idx` ON `sales_channels` (`code`);--> statement-breakpoint
CREATE TABLE `seo_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`title` text,
	`description` text,
	`keywords` text,
	`canonical_url` text,
	`og_title` text,
	`og_description` text,
	`og_image_media_id` text,
	`noindex` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`og_image_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seo_metadata_entity_uidx` ON `seo_metadata` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `seo_metadata_og_image_idx` ON `seo_metadata` (`og_image_media_id`);--> statement-breakpoint
CREATE TABLE `shipping_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`carrier` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipping_methods_code_unique` ON `shipping_methods` (`code`);--> statement-breakpoint
CREATE INDEX `shipping_methods_code_idx` ON `shipping_methods` (`code`);--> statement-breakpoint
CREATE TABLE `shipping_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`zone_id` text NOT NULL,
	`method_id` text NOT NULL,
	`currency_code` text NOT NULL,
	`min_weight` integer,
	`max_weight` integer,
	`min_order_amount` integer,
	`price_amount` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`zone_id`) REFERENCES `shipping_zones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`method_id`) REFERENCES `shipping_methods`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `shipping_rates_zone_id_idx` ON `shipping_rates` (`zone_id`);--> statement-breakpoint
CREATE INDEX `shipping_rates_method_id_idx` ON `shipping_rates` (`method_id`);--> statement-breakpoint
CREATE TABLE `shipping_zones` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`countries_json` text,
	`provinces_json` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`interval` text DEFAULT 'month' NOT NULL,
	`interval_count` integer DEFAULT 1 NOT NULL,
	`trial_days` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subscription_plans_product_id_idx` ON `subscription_plans` (`product_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'tag' NOT NULL,
	`color` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `tags_slug_idx` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `tags_type_idx` ON `tags` (`type`);--> statement-breakpoint
CREATE TABLE `translations` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`locale` text NOT NULL,
	`field` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `translations_entity_locale_field_uidx` ON `translations` (`entity_type`,`entity_id`,`locale`,`field`);--> statement-breakpoint
CREATE INDEX `translations_locale_idx` ON `translations` (`locale`);--> statement-breakpoint
CREATE TABLE `variant_attribute_values` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`attribute_id` text NOT NULL,
	`attribute_value_id` text,
	`value_text` text,
	`value_number` integer,
	`value_boolean` integer,
	`value_json` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `variant_attribute_values_variant_id_idx` ON `variant_attribute_values` (`variant_id`);--> statement-breakpoint
CREATE INDEX `variant_attribute_values_attribute_id_idx` ON `variant_attribute_values` (`attribute_id`);--> statement-breakpoint
CREATE INDEX `variant_attribute_values_value_id_idx` ON `variant_attribute_values` (`attribute_value_id`);--> statement-breakpoint
CREATE TABLE `variant_media` (
	`variant_id` text NOT NULL,
	`media_id` text NOT NULL,
	`role` text DEFAULT 'image' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`variant_id`, `media_id`),
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `variant_media_media_id_idx` ON `variant_media` (`media_id`);--> statement-breakpoint
CREATE TABLE `variant_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`currency_code` text NOT NULL,
	`channel_id` text,
	`price_amount` integer NOT NULL,
	`compare_at_amount` integer,
	`cost_amount` integer,
	`starts_at` integer,
	`ends_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`channel_id`) REFERENCES `sales_channels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `variant_prices_variant_id_idx` ON `variant_prices` (`variant_id`);--> statement-breakpoint
CREATE INDEX `variant_prices_currency_idx` ON `variant_prices` (`currency_code`);--> statement-breakpoint
CREATE INDEX `variant_prices_channel_idx` ON `variant_prices` (`channel_id`);--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`country` text,
	`province` text,
	`city` text,
	`address` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `warehouses_code_unique` ON `warehouses` (`code`);--> statement-breakpoint
CREATE INDEX `warehouses_code_idx` ON `warehouses` (`code`);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `title` text;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `barcode` text;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `default_media_id` text REFERENCES media_assets(id);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `weight_value` integer;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `weight_unit` text;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `length_value` integer;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `width_value` integer;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `height_value` integer;--> statement-breakpoint
ALTER TABLE `product_variants` ADD `dimension_unit` text;--> statement-breakpoint
CREATE INDEX `product_variants_default_media_idx` ON `product_variants` (`default_media_id`);--> statement-breakpoint
ALTER TABLE `products` ADD `product_type` text DEFAULT 'simple' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `short_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `brand_id` text REFERENCES brands(id);--> statement-breakpoint
ALTER TABLE `products` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `products` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `meta_keywords` text;--> statement-breakpoint
ALTER TABLE `products` ADD `requires_shipping` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `is_digital` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `products_brand_id_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE INDEX `products_type_status_idx` ON `products` (`product_type`,`status`);