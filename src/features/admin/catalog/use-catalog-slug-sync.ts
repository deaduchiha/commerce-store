import { useRef } from 'react'

import { slugify } from '#/lib/slug'

export function useCatalogSlugSync(initialSlug: string) {
  const slugTouchedRef = useRef(Boolean(initialSlug.trim()))

  function syncSlugFromName(
    name: string,
    setSlug: (slug: string) => void,
  ) {
    if (slugTouchedRef.current) {
      return
    }

    const nextSlug = slugify(name)
    if (nextSlug) {
      setSlug(nextSlug)
    }
  }

  function markSlugTouched() {
    slugTouchedRef.current = true
  }

  function resetSlugSync(nextInitialSlug: string) {
    slugTouchedRef.current = Boolean(nextInitialSlug.trim())
  }

  return {
    syncSlugFromName,
    markSlugTouched,
    resetSlugSync,
  }
}
