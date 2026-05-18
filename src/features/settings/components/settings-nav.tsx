import { Link, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

const settingsLinks = [
  { title: 'پروفایل', to: '/dashboard/settings/profile' as const },
  { title: 'آدرس‌ها', to: '/dashboard/settings/address-profile' as const },
]

export function SettingsNav() {
  const pathname = useRouterState({ select: s => s.location.pathname })

  return (
    <nav
      aria-label="Settings"
      className="flex flex-wrap gap-1 border-b border-border pb-4"
    >
      {settingsLinks.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === link.to
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {link.title}
        </Link>
      ))}
    </nav>
  )
}
