import { Link, useRouterState } from '@tanstack/react-router'

import { adminNavItems } from '#/lib/admin-nav'
import { cn } from '#/lib/utils'

export function AdminNav() {
  const pathname = useRouterState({ select: s => s.location.pathname })

  function isActive(item: (typeof adminNavItems)[number]) {
    if (item.matchPrefix) {
      return pathname.startsWith(item.to)
    }

    if (item.to === '/dashboard/admin') {
      return pathname === '/dashboard/admin' || pathname === '/dashboard/admin/'
    }

    return pathname === item.to || pathname.startsWith(`${item.to}/`)
  }

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-3">
      {adminNavItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive(item)
              ? 'bg-primary text-primary-foreground!'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <item.icon className="size-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
