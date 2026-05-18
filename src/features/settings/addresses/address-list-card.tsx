import type { Address } from '#/features/settings/addresses/address.schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Pencil, Star, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { getAddressLabel } from '#/features/settings/addresses/address.constants'
import { ConfirmDialog } from '#/features/settings/components/confirm-dialog'
import { orpc } from '#/orpc/client'

interface AddressListCardProps {
  address: Address
  onEdit: () => void
}

export function AddressListCard({ address, onEdit }: AddressListCardProps) {
  const queryClient = useQueryClient()

  const removeMutation = useMutation(
    orpc.address.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.address.list.key(),
        })
      },
    }),
  )

  const setDefaultMutation = useMutation(
    orpc.address.setDefault.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.address.list.key(),
        })
      },
    }),
  )

  const isBusy = removeMutation.isPending || setDefaultMutation.isPending

  const lines = [
    `${address.province}، ${address.city}`,
    address.district,
    address.streetAddress,
    [
      address.plateNumber && `پلاک ${address.plateNumber}`,
      address.unit && `واحد ${address.unit}`,
    ]
      .filter(Boolean)
      .join(' — '),
    `کد پستی: ${address.postalCode}`,
    `${address.recipientName} — ${address.recipientPhone}`,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <p className="font-medium">{getAddressLabel(address.label)}</p>
            {address.isDefault && (
              <Badge variant="secondary">پیش‌فرض</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{lines.join(' · ')}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {!address.isDefault && (
          <ConfirmDialog
            title="تنظیم آدرس پیش‌فرض"
            description="این آدرس برای سفارش‌های بعدی به‌صورت خودکار انتخاب می‌شود."
            confirmLabel="تنظیم پیش‌فرض"
            onConfirm={() =>
              setDefaultMutation.mutateAsync({ id: address.id })}
            trigger={(
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
              >
                <Star />
                پیش‌فرض
              </Button>
            )}
          />
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={onEdit}
        >
          <Pencil />
          ویرایش
        </Button>
        <ConfirmDialog
          title="حذف آدرس"
          description="این آدرس برای همیشه حذف می‌شود. این عمل قابل بازگشت نیست."
          confirmLabel="حذف"
          confirmVariant="destructive"
          onConfirm={() => removeMutation.mutateAsync({ id: address.id })}
          trigger={(
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isBusy}
            >
              <Trash2 />
              حذف
            </Button>
          )}
        />
      </div>
      {(removeMutation.isError || setDefaultMutation.isError) && (
        <p className="text-sm text-destructive">
          {removeMutation.error?.message
            ?? setDefaultMutation.error?.message
            ?? 'عملیات ناموفق بود.'}
        </p>
      )}
    </div>
  )
}
