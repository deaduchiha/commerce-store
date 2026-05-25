import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import { useDebouncedValue } from '#/hooks/use-debounced-value'

interface CatalogSearchContextValue {
  debouncedSearch: string
  isSearchActive: boolean
  resultCount: number | undefined
  setResultCount: (count: number | undefined) => void
}

const CatalogSearchContext = createContext<CatalogSearchContextValue | null>(null)

export function CatalogSearchProvider({
  search,
  children,
}: {
  search: string
  children: ReactNode
}) {
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const [resultCount, setResultCount] = useState<number | undefined>()

  const value = useMemo<CatalogSearchContextValue>(
    () => ({
      debouncedSearch,
      isSearchActive: debouncedSearch.length > 0,
      resultCount,
      setResultCount,
    }),
    [debouncedSearch, resultCount],
  )

  return (
    <CatalogSearchContext.Provider value={value}>
      {children}
    </CatalogSearchContext.Provider>
  )
}

export function useCatalogSearch() {
  const context = useContext(CatalogSearchContext)
  if (!context) {
    throw new Error('useCatalogSearch must be used within CatalogSearchProvider')
  }

  return context
}
