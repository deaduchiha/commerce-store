import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

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
    role: text('role', { enum: ['admin', 'user', 'author'] })
      .notNull()
      .default('user'),
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

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    brand: text('brand'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [index('products_slug_idx').on(table.slug)],
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
    size: text('size').notNull(),
    color: text('color').notNull(),
    priceInRials: integer('price_in_rials').notNull(),
    compareAtPriceInRials: integer('compare_at_price_in_rials'),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  table => [
    index('product_variants_product_id_idx').on(table.productId),
    uniqueIndex('product_variants_product_size_color_uidx').on(
      table.productId,
      table.size,
      table.color,
    ),
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

export const productRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}))

export const productVariantRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
  }),
)

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
