import type { FileRouteTypes } from '#/routeTree.gen'

export type BreadcrumbLinkTo = FileRouteTypes['to']

export interface RouteBreadcrumb {
  label: string
  /** Set false for layout-only segments with no dedicated page. */
  link?: boolean
}

export function toBreadcrumbLink(fullPath: string): BreadcrumbLinkTo {
  if (fullPath === '/dashboard/') {
    return '/dashboard'
  }

  return fullPath as BreadcrumbLinkTo
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?: RouteBreadcrumb
  }
}

export function routeBreadcrumb(
  label: string,
  options?: { link?: boolean },
) {
  return {
    breadcrumb: {
      label,
      link: options?.link,
    } satisfies RouteBreadcrumb,
  }
}
