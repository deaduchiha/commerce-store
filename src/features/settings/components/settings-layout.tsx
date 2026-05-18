import type { ReactNode } from 'react'

import { SettingsNav } from '#/features/settings/components/settings-nav'

interface SettingsLayoutProps {
  title: string
  description?: string
  children: ReactNode
}

export function SettingsLayout({
  title,
  description,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsNav />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
