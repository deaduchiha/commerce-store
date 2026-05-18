import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { AddressSection } from '#/features/settings/addresses/address-section'
import { ProfileForm } from '#/features/settings/profile/profile-form'
import { routeBreadcrumb } from '#/lib/breadcrumb'
import { orpc } from '#/orpc/client'

export const Route = createFileRoute('/dashboard/profile')({
  staticData: routeBreadcrumb('پروفایل'),
  component: ProfilePage,
})

function ProfilePage() {
  const profileQuery = useQuery(orpc.profile.get.queryOptions())

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">

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
      </section>

      <AddressSection />
    </div>
  )
}
