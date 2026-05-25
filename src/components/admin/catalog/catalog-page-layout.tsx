import type { ReactNode } from 'react'
import type { AdminCatalogNavItem } from '#/lib/admin-catalog-nav'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

import { CatalogSearchProvider, useCatalogSearch } from './catalog-search-context'

interface CatalogPageLayoutProps {
  section: AdminCatalogNavItem
  searchPlaceholder: string
  children: ReactNode
}

export function CatalogPageLayout({
  section,
  searchPlaceholder,
  children,
}: CatalogPageLayoutProps) {
  const [search, setSearch] = useState('')

  return (
    <CatalogSearchProvider search={search}>
      <div className="flex flex-col gap-6">
        <AdminPageHeader
          title={section.title}
          description={section.description}
        />

        <CatalogSearchToolbar
          search={search}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={setSearch}
        />

        {children}
      </div>
    </CatalogSearchProvider>
  )
}

function CatalogSearchToolbar({
  search,
  searchPlaceholder,
  onSearchChange,
}: {
  search: string
  searchPlaceholder: string
  onSearchChange: (value: string) => void
}) {
  const { isSearchActive, resultCount } = useCatalogSearch()

  return (
    <div className="flex flex-col gap-3 border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          className="ps-8"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>

      <div className="flex items-center gap-3">
        {resultCount !== undefined && (
          <span className="text-muted-foreground text-sm">
            {resultCount.toLocaleString('fa-IR')}
            {' '}
            نتیجه
          </span>
        )}
        {isSearchActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSearchChange('')}
          >
            <X />
            پاک کردن
          </Button>
        )}
      </div>
    </div>
  )
}
