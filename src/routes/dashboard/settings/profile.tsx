import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { SettingsLayout } from '#/features/settings/components/settings-layout'
import { ProfileForm } from '#/features/settings/profile/profile-form'
import { orpc } from '#/orpc/client'

export const Route = createFileRoute('/dashboard/settings/profile')({
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  const profileQuery = useQuery(orpc.profile.get.queryOptions())

  return (
    <SettingsLayout
      title="پروفایل"
      description="نام نمایشی خود را ویرایش کنید."
    >
      {profileQuery.isPending && (
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      )}

      {profileQuery.isError && (
        <p className="text-sm text-destructive">
          بارگذاری پروفایل ناموفق بود.
        </p>
      )}

      {profileQuery.data && (
        <ProfileForm
          key={`${profileQuery.data.id}-${profileQuery.data.name}`}
          profile={profileQuery.data}
        />
      )}
    </SettingsLayout>
  )
}
