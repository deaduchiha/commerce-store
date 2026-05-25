import { createFileRoute } from '@tanstack/react-router'

import { StorefrontProductBrowse } from '#/features/storefront/storefront-product-browse'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return <StorefrontProductBrowse />
}
