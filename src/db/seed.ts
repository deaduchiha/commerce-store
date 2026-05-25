import Database from 'better-sqlite3'

/**
 * Persian / Iranian catalog + product seed data.
 * Run: pnpm db:seed
 * Re-seed: pnpm db:seed -- --force
 */
import { config } from 'dotenv'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import * as schema from './schema.ts'

config({ path: ['.env.local', '.env'] })

const databasePath = process.env.DATABASE_URL ?? './dev.db'
const force = process.argv.includes('--force')

const sqlite = new Database(databasePath)
const db = drizzle(sqlite, { schema })

const {
  attributes,
  attributeValues,
  brands,
  categories,
  categoryClosure,
  collectionProducts,
  collections,
  productAttributeValues,
  productCategories,
  products,
  productTags,
  productVariants,
  tags,
  variantAttributeValues,
} = schema

async function rebuildCategoryClosureLocal() {
  const rows = await db.select().from(categories)
  const byId = new Map(rows.map(row => [row.id, row]))
  const closureRows: Array<{
    ancestorId: string
    descendantId: string
    depth: number
  }> = []

  for (const category of rows) {
    closureRows.push({
      ancestorId: category.id,
      descendantId: category.id,
      depth: 0,
    })

    let parentId = category.parentId
    let depth = 1

    while (parentId) {
      closureRows.push({
        ancestorId: parentId,
        descendantId: category.id,
        depth,
      })
      parentId = byId.get(parentId)?.parentId ?? null
      depth += 1
    }
  }

  await db.delete(categoryClosure)
  if (closureRows.length > 0) {
    await db.insert(categoryClosure).values(closureRows)
  }
}

// ——— Catalog reference data (slugs = ASCII, names = Persian) ———

const brandRows = [
  { slug: 'nike', name: 'نایکی', description: 'برند آمریکایی؛ محبوب در بازار ایران' },
  { slug: 'adidas', name: 'آدیداس', description: 'سه‌خط آدیداس؛ حضور قوی در فروشگاه‌های تهران' },
  { slug: 'puma', name: 'پوما', description: 'طراحی ورزشی و روزمره' },
  { slug: 'new-balance', name: 'نیو بالانس', description: 'راحتی و دویدن' },
  { slug: 'asics', name: 'اسیکس', description: 'تخصص دو و میدانی' },
  { slug: 'vans', name: 'ونس', description: 'اسکیت و استایل خیابانی' },
  { slug: 'converse', name: 'کانورس', description: 'کلاسیک چاک تیلور' },
  { slug: 'iran-sport', name: 'ایران اسپرت', description: 'برند داخلی با تولید در مشهد' },
] as const

const categoryRows = [
  { slug: 'sneakers', name: 'کتانی', description: 'انواع کفش ورزشی و اسپرت', sortOrder: 0, parentSlug: null },
  { slug: 'running', name: 'دویدن', description: 'کفش مناسب پیاده‌روی و ماراتن', sortOrder: 1, parentSlug: null },
  { slug: 'basketball', name: 'بسکتبال', description: 'کفش‌های کوتاه و میدانی', sortOrder: 2, parentSlug: null },
  { slug: 'casual', name: 'روزمره', description: 'استایل شهری و راحتی', sortOrder: 3, parentSlug: null },
  { slug: 'kids', name: 'کودکان', description: 'سایزبندی کودک و نوجوان', sortOrder: 4, parentSlug: null },
  { slug: 'outlet', name: 'حراجی', description: 'تخفیف‌های فصلی', sortOrder: 5, parentSlug: null },
  { slug: 'lifestyle', name: 'لایف‌استایل', description: 'مد روز با کتانی', sortOrder: 0, parentSlug: 'sneakers' },
  { slug: 'high-top', name: 'های‌تاپ', description: 'ساق بلند', sortOrder: 1, parentSlug: 'sneakers' },
  { slug: 'trail', name: 'کوهنوردی', description: 'مسیرهای کوه و طبیعت', sortOrder: 0, parentSlug: 'running' },
  { slug: 'streetball', name: 'استریت‌بال', description: 'بسکتبال خیابانی', sortOrder: 0, parentSlug: 'basketball' },
] as const

const attributeDefs = [
  {
    code: 'size',
    name: 'سایز',
    type: 'select' as const,
    scope: 'variant' as const,
    isFilterable: true,
    isVariantOption: true,
    sortOrder: 0,
    values: [
      { value: '۴۰', slug: '40', sortOrder: 0 },
      { value: '۴۱', slug: '41', sortOrder: 1 },
      { value: '۴۲', slug: '42', sortOrder: 2 },
      { value: '۴۳', slug: '43', sortOrder: 3 },
      { value: '۴۴', slug: '44', sortOrder: 4 },
      { value: '۴۵', slug: '45', sortOrder: 5 },
    ],
  },
  {
    code: 'color',
    name: 'رنگ',
    type: 'color' as const,
    scope: 'variant' as const,
    isFilterable: true,
    isVariantOption: true,
    sortOrder: 1,
    values: [
      { value: 'سفید', slug: 'white', colorHex: '#FFFFFF', sortOrder: 0 },
      { value: 'مشکی', slug: 'black', colorHex: '#111827', sortOrder: 1 },
      { value: 'خاکستری', slug: 'gray', colorHex: '#6B7280', sortOrder: 2 },
      { value: 'قرمز', slug: 'red', colorHex: '#DC2626', sortOrder: 3 },
      { value: 'آبی', slug: 'blue', colorHex: '#2563EB', sortOrder: 4 },
      { value: 'بنفش', slug: 'purple', colorHex: '#7C3AED', sortOrder: 5 },
    ],
  },
  {
    code: 'gender',
    name: 'جنسیت',
    type: 'select' as const,
    scope: 'product' as const,
    isFilterable: true,
    isVariantOption: false,
    sortOrder: 2,
    values: [
      { value: 'مردانه', slug: 'men', sortOrder: 0 },
      { value: 'زنانه', slug: 'women', sortOrder: 1 },
      { value: 'یونیسکس', slug: 'unisex', sortOrder: 2 },
    ],
  },
  {
    code: 'upper-material',
    name: 'جنس رویه',
    type: 'select' as const,
    scope: 'product' as const,
    isFilterable: true,
    isVariantOption: false,
    sortOrder: 3,
    values: [
      { value: 'چرم مصنوعی', slug: 'synthetic-leather', sortOrder: 0 },
      { value: 'مش', slug: 'mesh', sortOrder: 1 },
      { value: 'کتان', slug: 'canvas', sortOrder: 2 },
      { value: 'جیر', slug: 'suede', sortOrder: 3 },
    ],
  },
  {
    code: 'season',
    name: 'فصل',
    type: 'select' as const,
    scope: 'product' as const,
    isFilterable: true,
    isVariantOption: false,
    sortOrder: 4,
    values: [
      { value: 'بهار و تابستان', slug: 'spring-summer', sortOrder: 0 },
      { value: 'پاییز و زمستان', slug: 'fall-winter', sortOrder: 1 },
      { value: 'چهار فصل', slug: 'all-season', sortOrder: 2 },
    ],
  },
  {
    code: 'sole-type',
    name: 'نوع زیره',
    type: 'select' as const,
    scope: 'product' as const,
    isFilterable: false,
    isVariantOption: false,
    sortOrder: 5,
    values: [
      { value: 'لاستیک', slug: 'rubber', sortOrder: 0 },
      { value: 'فوم EVA', slug: 'eva-foam', sortOrder: 1 },
      { value: 'ژل', slug: 'gel', sortOrder: 2 },
    ],
  },
] as const

const collectionRows = [
  { slug: 'best-sellers', name: 'پرفروش‌ترین‌ها', description: 'محبوب‌ترین مدل‌ها در ایران', type: 'manual' as const },
  { slug: 'winter-sale', name: 'حراج زمستان', description: 'تخفیف ویژه دی و بهمن', type: 'manual' as const },
  { slug: 'nowruz-1405', name: 'نوروز ۱۴۰۵', description: 'کالکشن ویژه عید', type: 'manual' as const },
  { slug: 'new-arrivals', name: 'جدیدترین‌ها', description: 'تازه‌وارد به انبار تهران', type: 'manual' as const },
  { slug: 'basketball-picks', name: 'انتخاب بسکتبال', description: 'برای علاقه‌مندان NBA', type: 'manual' as const },
  { slug: 'tehran-express', name: 'ارسال سریع تهران', description: 'ارسال ۲۴ ساعته داخل تهران', type: 'manual' as const },
] as const

const tagRows = [
  { slug: 'new', name: 'جدید', type: 'tag' as const, color: '#16A34A' },
  { slug: 'bestseller', name: 'پرفروش', type: 'tag' as const, color: '#CA8A04' },
  { slug: 'sale', name: 'تخفیف‌دار', type: 'tag' as const, color: '#DC2626' },
  { slug: 'limited', name: 'نسخه محدود', type: 'tag' as const, color: '#7C3AED' },
  { slug: 'free-shipping', name: 'ارسال رایگان', type: 'tag' as const, color: '#0891B2' },
  { slug: 'featured', name: 'پیشنهاد ویژه', type: 'label' as const, color: '#EA580C' },
  { slug: 'cod', name: 'پرداخت در محل', type: 'label' as const, color: '#4B5563' },
  { slug: 'original', name: 'اصل', type: 'tag' as const, color: '#1D4ED8' },
] as const

interface ProductSeed {
  slug: string
  name: string
  shortDescription: string
  description: string
  brandSlug: string
  categorySlugs: string[]
  collectionSlugs: string[]
  tagSlugs: string[]
  genderSlug: string
  materialSlug: string
  seasonSlug: string
  soleSlug: string
  variants: Array<{
    sku: string
    sizeSlug: string
    colorSlug: string
    priceInRials: number
    compareAtPriceInRials?: number
    stockQuantity: number
  }>
}

const productRows: ProductSeed[] = [
  {
    slug: 'nike-air-max-90-tehran',
    name: 'نایکی ایر مکس ۹۰ — ویرایش تهران',
    shortDescription: 'راحتی روزمره با طراحی کلاسیک؛ مناسب پیاده‌روی در شهر.',
    description: 'کفش نایکی ایر مکس ۹۰ با رویه مش و جزئیات چرم مصنوعی. مناسب استفاده روزمره در تهران و کلان‌شهرها.',
    brandSlug: 'nike',
    categorySlugs: ['sneakers', 'lifestyle', 'casual'],
    collectionSlugs: ['best-sellers', 'new-arrivals'],
    tagSlugs: ['bestseller', 'original', 'featured'],
    genderSlug: 'unisex',
    materialSlug: 'mesh',
    seasonSlug: 'all-season',
    soleSlug: 'rubber',
    variants: [
      { sku: 'NK-AM90-42-WHT', sizeSlug: '42', colorSlug: 'white', priceInRials: 28_500_000, compareAtPriceInRials: 32_000_000, stockQuantity: 12 },
      { sku: 'NK-AM90-43-BLK', sizeSlug: '43', colorSlug: 'black', priceInRials: 28_500_000, stockQuantity: 8 },
    ],
  },
  {
    slug: 'adidas-ultraboost-22',
    name: 'آدیداس اولترابوست ۲۲',
    shortDescription: 'فوم بوست برای دویدن طولانی در پارک‌های تهران.',
    description: 'کفش دویدن آدیداس با زیره Boost و رویه Primeknit. انتخاب مناسب برای ماراتن تهران و نیمه‌ماراتن.',
    brandSlug: 'adidas',
    categorySlugs: ['running', 'trail'],
    collectionSlugs: ['best-sellers'],
    tagSlugs: ['original', 'new'],
    genderSlug: 'men',
    materialSlug: 'mesh',
    seasonSlug: 'spring-summer',
    soleSlug: 'eva-foam',
    variants: [
      { sku: 'AD-UB22-41-BLU', sizeSlug: '41', colorSlug: 'blue', priceInRials: 35_200_000, stockQuantity: 6 },
      { sku: 'AD-UB22-42-BLU', sizeSlug: '42', colorSlug: 'blue', priceInRials: 35_200_000, stockQuantity: 10 },
      { sku: 'AD-UB22-44-GRY', sizeSlug: '44', colorSlug: 'gray', priceInRials: 34_800_000, compareAtPriceInRials: 38_000_000, stockQuantity: 4 },
    ],
  },
  {
    slug: 'puma-rs-x-iran',
    name: 'پوما آر‌اس-ایکس — طرح ایران',
    shortDescription: 'استایل رترو با رنگ‌بندی الهام‌گرفته از پرچم.',
    description: 'کتانی پوما با طراحی ضخیم و رنگ‌های قرمز و سفید. مناسب استایل خیابانی و دورهمی‌های آخر هفته.',
    brandSlug: 'puma',
    categorySlugs: ['sneakers', 'casual'],
    collectionSlugs: ['nowruz-1405', 'new-arrivals'],
    tagSlugs: ['new', 'limited'],
    genderSlug: 'unisex',
    materialSlug: 'synthetic-leather',
    seasonSlug: 'all-season',
    soleSlug: 'rubber',
    variants: [
      { sku: 'PM-RSX-42-RED', sizeSlug: '42', colorSlug: 'red', priceInRials: 18_900_000, stockQuantity: 15 },
      { sku: 'PM-RSX-43-WHT', sizeSlug: '43', colorSlug: 'white', priceInRials: 18_900_000, stockQuantity: 9 },
    ],
  },
  {
    slug: 'new-balance-574-classic',
    name: 'نیو بالانس ۵۷۴ کلاسیک',
    shortDescription: 'آیکون راحتی؛ مناسب دانشگاه و محل کار.',
    description: 'مدل ۵۷۴ با ساختار سویید و مش. یکی از پرطرفدارترین مدل‌ها در فروشگاه‌های آنلاین ایران.',
    brandSlug: 'new-balance',
    categorySlugs: ['casual', 'lifestyle'],
    collectionSlugs: ['best-sellers', 'winter-sale'],
    tagSlugs: ['bestseller', 'sale'],
    genderSlug: 'women',
    materialSlug: 'suede',
    seasonSlug: 'fall-winter',
    soleSlug: 'rubber',
    variants: [
      { sku: 'NB-574-38-GRY', sizeSlug: '40', colorSlug: 'gray', priceInRials: 22_400_000, compareAtPriceInRials: 26_000_000, stockQuantity: 7 },
      { sku: 'NB-574-39-NVY', sizeSlug: '41', colorSlug: 'blue', priceInRials: 22_400_000, stockQuantity: 5 },
    ],
  },
  {
    slug: 'asics-gel-kayano-30',
    name: 'اسیکس ژل کایانو ۳۰',
    shortDescription: 'پشتیبانی بالا برای دویدن‌های طولانی.',
    description: 'فناوری GEL در زیره؛ مناسب دوندگان با وزن بیشتر و کف پای صاف.',
    brandSlug: 'asics',
    categorySlugs: ['running'],
    collectionSlugs: ['tehran-express'],
    tagSlugs: ['original', 'free-shipping'],
    genderSlug: 'men',
    materialSlug: 'mesh',
    seasonSlug: 'all-season',
    soleSlug: 'gel',
    variants: [
      { sku: 'AS-GK30-42-BLK', sizeSlug: '42', colorSlug: 'black', priceInRials: 31_500_000, stockQuantity: 11 },
      { sku: 'AS-GK30-43-BLK', sizeSlug: '43', colorSlug: 'black', priceInRials: 31_500_000, stockQuantity: 6 },
    ],
  },
  {
    slug: 'vans-old-skool-black',
    name: 'ونس اولد اسکول مشکی',
    shortDescription: 'کلاسیک اسکیت؛ همیشه در مد.',
    description: 'خط سفید وانز روی رویه مشکی. انتخاب محبوب جوانان در اصفهان، شیراز و تهران.',
    brandSlug: 'vans',
    categorySlugs: ['casual', 'sneakers'],
    collectionSlugs: ['best-sellers'],
    tagSlugs: ['bestseller', 'cod'],
    genderSlug: 'unisex',
    materialSlug: 'canvas',
    seasonSlug: 'all-season',
    soleSlug: 'rubber',
    variants: [
      { sku: 'VN-OS-40-BLK', sizeSlug: '40', colorSlug: 'black', priceInRials: 14_800_000, stockQuantity: 20 },
      { sku: 'VN-OS-41-BLK', sizeSlug: '41', colorSlug: 'black', priceInRials: 14_800_000, stockQuantity: 18 },
      { sku: 'VN-OS-42-BLK', sizeSlug: '42', colorSlug: 'black', priceInRials: 14_800_000, stockQuantity: 14 },
    ],
  },
  {
    slug: 'converse-chuck-70-hi',
    name: 'کانورس چاک ۷۰ های‌تاپ',
    shortDescription: 'نسخه پریمیوم چاک تیلور با ساق بلند.',
    description: 'کتان ضخیم‌تر و زیره راحت‌تر نسبت به مدل کلاسیک. مناسب استایل مینیمال.',
    brandSlug: 'converse',
    categorySlugs: ['high-top', 'casual'],
    collectionSlugs: ['new-arrivals'],
    tagSlugs: ['new', 'original'],
    genderSlug: 'unisex',
    materialSlug: 'canvas',
    seasonSlug: 'spring-summer',
    soleSlug: 'rubber',
    variants: [
      { sku: 'CV-CH70-42-WHT', sizeSlug: '42', colorSlug: 'white', priceInRials: 16_200_000, stockQuantity: 9 },
      { sku: 'CV-CH70-43-BLK', sizeSlug: '43', colorSlug: 'black', priceInRials: 16_200_000, stockQuantity: 7 },
    ],
  },
  {
    slug: 'nike-lebron-witness-8',
    name: 'نایکی لبرون ویتنس ۸',
    shortDescription: 'کفش بسکتبال با پشتیبانی مچ پا.',
    description: 'مناسب زمین‌های پارکی و سالن‌های سرپوشیده. طراحی مدرن با رنگ‌بندی پرانرژی.',
    brandSlug: 'nike',
    categorySlugs: ['basketball', 'streetball'],
    collectionSlugs: ['basketball-picks'],
    tagSlugs: ['featured', 'limited'],
    genderSlug: 'men',
    materialSlug: 'synthetic-leather',
    seasonSlug: 'all-season',
    soleSlug: 'rubber',
    variants: [
      { sku: 'NK-LBW8-44-PUR', sizeSlug: '44', colorSlug: 'purple', priceInRials: 24_600_000, stockQuantity: 5 },
      { sku: 'NK-LBW8-45-PUR', sizeSlug: '45', colorSlug: 'purple', priceInRials: 24_600_000, stockQuantity: 3 },
    ],
  },
  {
    slug: 'iran-sport-kids-runner',
    name: 'ایران اسپرت دونده کودک',
    shortDescription: 'کتانی سبک برای مدرسه و بازی.',
    description: 'تولید داخل با قیمت مناسب؛ مناسب خانواده‌های ایرانی. سایزبندی کودک.',
    brandSlug: 'iran-sport',
    categorySlugs: ['kids', 'running'],
    collectionSlugs: ['winter-sale', 'tehran-express'],
    tagSlugs: ['sale', 'cod'],
    genderSlug: 'unisex',
    materialSlug: 'mesh',
    seasonSlug: 'all-season',
    soleSlug: 'eva-foam',
    variants: [
      { sku: 'IS-KID-36-RED', sizeSlug: '40', colorSlug: 'red', priceInRials: 6_500_000, compareAtPriceInRials: 8_200_000, stockQuantity: 25 },
      { sku: 'IS-KID-37-BLU', sizeSlug: '41', colorSlug: 'blue', priceInRials: 6_500_000, stockQuantity: 22 },
    ],
  },
  {
    slug: 'adidas-forum-low-tehran-nights',
    name: 'آدیداس فوروم لو — شب‌های تهران',
    shortDescription: 'بسکتبال رترو با جزئیات طلایی.',
    description: 'طراحی الهام‌گرفته از نورهای شهر؛ مناسب استایل شبانه و مهمانی.',
    brandSlug: 'adidas',
    categorySlugs: ['basketball', 'lifestyle', 'outlet'],
    collectionSlugs: ['nowruz-1405', 'winter-sale'],
    tagSlugs: ['sale', 'featured', 'free-shipping'],
    genderSlug: 'women',
    materialSlug: 'synthetic-leather',
    seasonSlug: 'fall-winter',
    soleSlug: 'rubber',
    variants: [
      { sku: 'AD-FRM-39-WHT', sizeSlug: '40', colorSlug: 'white', priceInRials: 19_800_000, compareAtPriceInRials: 24_000_000, stockQuantity: 8 },
      { sku: 'AD-FRM-40-BLK', sizeSlug: '41', colorSlug: 'black', priceInRials: 19_800_000, stockQuantity: 6 },
    ],
  },
]

async function countProducts() {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(products)
  return Number(row?.count ?? 0)
}

async function clearCatalogData() {
  await db.delete(variantAttributeValues)
  await db.delete(productAttributeValues)
  await db.delete(productTags)
  await db.delete(collectionProducts)
  await db.delete(productCategories)
  await db.delete(productVariants)
  await db.delete(products)
  await db.delete(attributeValues)
  await db.delete(attributes)
  await db.delete(categoryClosure)
  await db.delete(categories)
  await db.delete(brands)
  await db.delete(collections)
  await db.delete(tags)
}

async function insertVariantOptions(
  variantId: string,
  optionSlugs: Array<{ code: string, valueSlug: string }>,
  attributeIdByCode: Map<string, string>,
  attributeValueIdByKey: Map<string, string>,
) {
  const rows = optionSlugs.map(({ code, valueSlug }) => ({
    variantId,
    attributeId: attributeIdByCode.get(code)!,
    attributeValueId: attributeValueIdByKey.get(`${code}:${valueSlug}`)!,
    valueText: null,
    valueNumber: null,
    valueBoolean: null,
    valueJson: null,
  }))

  await db.insert(variantAttributeValues).values(rows)
}

async function seed() {
  const productCount = await countProducts()
  if (productCount > 0 && !force) {
    console.log(
      `Database already has ${productCount} product(s). Run with --force to replace catalog seed data.`,
    )
    sqlite.close()
    return
  }

  if (force || productCount > 0) {
    console.log('Clearing existing catalog data…')
    await clearCatalogData()
  }

  console.log(`Seeding into ${databasePath}…`)

  const brandIdBySlug = new Map<string, string>()
  for (const row of brandRows) {
    const [inserted] = await db
      .insert(brands)
      .values({
        slug: row.slug,
        name: row.name,
        description: row.description,
        websiteUrl: `https://${row.slug}.example.ir`,
        isActive: true,
      })
      .returning({ id: brands.id, slug: brands.slug })
    brandIdBySlug.set(inserted!.slug, inserted!.id)
  }
  console.log(`  brands: ${brandRows.length}`)

  const categoryIdBySlug = new Map<string, string>()
  for (const row of categoryRows.filter(r => !r.parentSlug)) {
    const [inserted] = await db
      .insert(categories)
      .values({
        slug: row.slug,
        name: row.name,
        description: row.description,
        sortOrder: row.sortOrder,
        isActive: true,
      })
      .returning({ id: categories.id, slug: categories.slug })
    categoryIdBySlug.set(inserted!.slug, inserted!.id)
  }
  for (const row of categoryRows.filter(r => r.parentSlug)) {
    const parentId = categoryIdBySlug.get(row.parentSlug!)
    const [inserted] = await db
      .insert(categories)
      .values({
        parentId,
        slug: row.slug,
        name: row.name,
        description: row.description,
        sortOrder: row.sortOrder,
        isActive: true,
      })
      .returning({ id: categories.id, slug: categories.slug })
    categoryIdBySlug.set(inserted!.slug, inserted!.id)
  }
  await rebuildCategoryClosureLocal()
  console.log(`  categories: ${categoryRows.length}`)

  const attributeIdByCode = new Map<string, string>()
  const attributeValueIdByKey = new Map<string, string>()

  for (const def of attributeDefs) {
    const [attr] = await db
      .insert(attributes)
      .values({
        code: def.code,
        name: def.name,
        type: def.type,
        scope: def.scope,
        isFilterable: def.isFilterable,
        isVariantOption: def.isVariantOption,
        isRequired: false,
        sortOrder: def.sortOrder,
      })
      .returning({ id: attributes.id })
    attributeIdByCode.set(def.code, attr!.id)

    for (const val of def.values) {
      const [inserted] = await db
        .insert(attributeValues)
        .values({
          attributeId: attr!.id,
          value: val.value,
          slug: val.slug,
          colorHex: 'colorHex' in val ? val.colorHex : null,
          sortOrder: val.sortOrder,
        })
        .returning({ id: attributeValues.id })
      attributeValueIdByKey.set(`${def.code}:${val.slug}`, inserted!.id)
    }
  }
  console.log(`  attributes: ${attributeDefs.length}`)

  const collectionIdBySlug = new Map<string, string>()
  for (const row of collectionRows) {
    const [inserted] = await db
      .insert(collections)
      .values({
        slug: row.slug,
        name: row.name,
        description: row.description,
        type: row.type,
        isActive: true,
      })
      .returning({ id: collections.id, slug: collections.slug })
    collectionIdBySlug.set(inserted!.slug, inserted!.id)
  }
  console.log(`  collections: ${collectionRows.length}`)

  const tagIdBySlug = new Map<string, string>()
  for (const row of tagRows) {
    const [inserted] = await db
      .insert(tags)
      .values({
        slug: row.slug,
        name: row.name,
        type: row.type,
        color: row.color,
        isActive: true,
      })
      .returning({ id: tags.id, slug: tags.slug })
    tagIdBySlug.set(inserted!.slug, inserted!.id)
  }
  console.log(`  tags: ${tagRows.length}`)

  for (const product of productRows) {
    const brandId = brandIdBySlug.get(product.brandSlug)
    const [row] = await db
      .insert(products)
      .values({
        productType: 'variable',
        status: 'active',
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        brandId,
        metaTitle: product.name,
        metaDescription: product.shortDescription,
        metaKeywords: 'کتانی,کفش,ایران,تهران',
        requiresShipping: true,
        isDigital: false,
        isActive: true,
      })
      .returning({ id: products.id })

    const productId = row!.id

    await db.insert(productCategories).values(
      product.categorySlugs.map((slug, index) => ({
        productId,
        categoryId: categoryIdBySlug.get(slug)!,
        isPrimary: index === 0,
        sortOrder: index,
      })),
    )

    await db.insert(productTags).values(
      product.tagSlugs.map(tagSlug => ({
        productId,
        tagId: tagIdBySlug.get(tagSlug)!,
      })),
    )

    await db.insert(collectionProducts).values(
      product.collectionSlugs.map((slug, index) => ({
        collectionId: collectionIdBySlug.get(slug)!,
        productId,
        sortOrder: index,
      })),
    )

    const productAttrs = [
      { code: 'gender', slug: product.genderSlug },
      { code: 'upper-material', slug: product.materialSlug },
      { code: 'season', slug: product.seasonSlug },
      { code: 'sole-type', slug: product.soleSlug },
    ]

    for (const { code, slug } of productAttrs) {
      const attributeId = attributeIdByCode.get(code)!
      const attributeValueId = attributeValueIdByKey.get(`${code}:${slug}`)
      await db.insert(productAttributeValues).values({
        productId,
        attributeId,
        attributeValueId,
      })
    }

    for (const variant of product.variants) {
      const [variantRow] = await db
        .insert(productVariants)
        .values({
          productId,
          sku: variant.sku,
          priceInRials: variant.priceInRials,
          compareAtPriceInRials: variant.compareAtPriceInRials ?? null,
          stockQuantity: variant.stockQuantity,
          isActive: true,
        })
        .returning({ id: productVariants.id })

      await insertVariantOptions(
        variantRow!.id,
        [
          { code: 'size', valueSlug: variant.sizeSlug },
          { code: 'color', valueSlug: variant.colorSlug },
        ],
        attributeIdByCode,
        attributeValueIdByKey,
      )
    }
  }
  console.log(`  products: ${productRows.length}`)

  console.log('Seed completed.')
  sqlite.close()
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  sqlite.close()
  process.exit(1)
})
