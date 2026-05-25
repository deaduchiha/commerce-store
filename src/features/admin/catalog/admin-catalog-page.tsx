import type { CatalogSection } from './catalog-types'
import { Boxes, FolderTree, Layers3, Search, Tags } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { Input } from '#/components/ui/input'

import {
  AttributesSection,
  BrandsSection,
  CategoriesSection,
  CollectionsSection,
  TagsSection,
} from './catalog-sections'

const catalogSections: Array<{
  value: CatalogSection
  label: string
  description: string
  icon: typeof Boxes
}> = [
  {
    value: 'categories',
    label: 'دسته‌بندی‌ها',
    description: 'ساختار چندسطحی کاتالوگ',
    icon: FolderTree,
  },
  {
    value: 'brands',
    label: 'برندها',
    description: 'برندهای قابل اتصال به محصول',
    icon: Boxes,
  },
  {
    value: 'attributes',
    label: 'ویژگی‌ها',
    description: 'فیلترها و گزینه‌های تنوع محصول',
    icon: Layers3,
  },
  {
    value: 'collections',
    label: 'کالکشن‌ها',
    description: 'گروه‌های دستی یا هوشمند محصول',
    icon: Boxes,
  },
  {
    value: 'tags',
    label: 'تگ‌ها و لیبل‌ها',
    description: 'New، Featured، Best Seller و...',
    icon: Tags,
  },
]

export function AdminCatalogPage() {
  const [section, setSection] = useState<CatalogSection>('categories')
  const [search, setSearch] = useState('')

  const activeSection = catalogSections.find(item => item.value === section)!

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="کاتالوگ"
        description="مدیریت دسته‌بندی‌ها، برندها، ویژگی‌های پویا، کالکشن‌ها و لیبل‌ها"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {catalogSections.map((item) => {
          const Icon = item.icon
          const isActive = item.value === section

          return (
            <button
              key={item.value}
              type="button"
              data-active={isActive}
              className="flex min-h-24 flex-col items-start gap-2 border bg-background p-4 text-start transition-colors hover:bg-muted/40 data-[active=true]:border-primary data-[active=true]:bg-primary/5"
              onClick={() => {
                setSection(item.value)
                setSearch('')
              }}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4" />
                {item.label}
              </span>
              <span className="text-muted-foreground text-xs leading-5">
                {item.description}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 border bg-background p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{activeSection.label}</h2>
          <p className="text-muted-foreground text-sm">
            {activeSection.description}
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="ps-8"
            placeholder="جستجو"
            aria-label="جستجو در کاتالوگ"
          />
        </div>
      </div>

      {section === 'categories' && <CategoriesSection search={search} />}
      {section === 'brands' && <BrandsSection search={search} />}
      {section === 'attributes' && <AttributesSection search={search} />}
      {section === 'collections' && <CollectionsSection search={search} />}
      {section === 'tags' && <TagsSection search={search} />}
    </div>
  )
}
