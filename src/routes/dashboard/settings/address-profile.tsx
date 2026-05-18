import { createFileRoute } from '@tanstack/react-router'

import { SettingsLayout } from '#/features/settings/components/settings-layout'

export const Route = createFileRoute('/dashboard/settings/address-profile')({
  component: AddressProfileSettingsPage,
})

function AddressProfileSettingsPage() {
  return (
    <SettingsLayout
      title="آدرس‌ها"
      description="مدیریت آدرس‌های تحویل برای سفارش کفش."
    >
      <p className="text-sm text-muted-foreground">
        مدیریت آدرس به‌زودی اضافه می‌شود.
      </p>
    </SettingsLayout>
  )
}
