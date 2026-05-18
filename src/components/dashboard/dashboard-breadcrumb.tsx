import { Link, useMatches } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { toBreadcrumbLink } from '#/lib/breadcrumb'

export function DashboardBreadcrumb() {
  const crumbs = useMatches({
    select: matches =>
      matches
        .filter(match => match.staticData?.breadcrumb)
        .map((match, index, all) => {
          const { label, link } = match.staticData.breadcrumb!
          const isLast = index === all.length - 1

          return {
            label,
            to:
              !isLast && link !== false
                ? toBreadcrumbLink(match.fullPath)
                : undefined,
          }
        }),
  })

  const items = crumbs.flatMap((crumb, index) => {
    const item = (
      <BreadcrumbItem key={`${crumb.label}-${index}`}>
        {crumb.to
          ? (
              <BreadcrumbLink asChild>
                <Link to={crumb.to}>{crumb.label}</Link>
              </BreadcrumbLink>
            )
          : (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            )}
      </BreadcrumbItem>
    )

    if (index === 0) {
      return [item]
    }

    return [
      <BreadcrumbSeparator key={`sep-${index}`} />,
      item,
    ]
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>{items}</BreadcrumbList>
    </Breadcrumb>
  )
}
