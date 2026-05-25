DROP INDEX `product_variants_product_size_color_uidx`;--> statement-breakpoint
ALTER TABLE `product_variants` DROP COLUMN `size`;--> statement-breakpoint
ALTER TABLE `product_variants` DROP COLUMN `color`;