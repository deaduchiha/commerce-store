import { createFileRoute } from '@tanstack/react-router'

import { AddressSection } from '#/features/settings/addresses/address-section'
import { ProfileCard } from '#/features/settings/profile/profile-card'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/profile')({
  staticData: routeBreadcrumb('پروفایل'),
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <ProfileCard />
      <AddressSection />
    </div>
  )
}
