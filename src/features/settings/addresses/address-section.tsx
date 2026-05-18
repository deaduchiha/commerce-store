import type { Address } from '#/features/settings/addresses/address.schema'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Skeleton } from '#/components/ui/skeleton'
import { AddressForm } from '#/features/settings/addresses/address-form'
import { AddressListCard } from '#/features/settings/addresses/address-list-card'
import { orpc } from '#/orpc/client'

type AddressDialogMode = 'create' | 'edit' | null

function AddressSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  )
}

export function AddressSection() {
  const [dialogMode, setDialogMode] = useState<AddressDialogMode>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formDirty, setFormDirty] = useState(false)
  const addressesQuery = useQuery(orpc.address.list.queryOptions())

  const dialogOpen = dialogMode !== null

  function closeDialog() {
    setDialogMode(null)
    setEditingAddress(null)
    setFormDirty(false)
  }

  function openCreateDialog() {
    setEditingAddress(null)
    setDialogMode('create')
    setFormDirty(false)
  }

  function openEditDialog(address: Address) {
    setEditingAddress(address)
    setDialogMode('edit')
    setFormDirty(false)
  }

  function handleDialogOpenChange(open: boolean) {
    if (open) {
      return
    }

    if (formDirty) {
      return
    }

    closeDialog()
  }

  if (addressesQuery.isPending) {
    return <AddressSectionSkeleton />
  }

  if (addressesQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>آدرس‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            بارگذاری آدرس‌ها ناموفق بود.
          </p>
        </CardContent>
      </Card>
    )
  }

  const addresses = addressesQuery.data

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>آدرس‌ها</CardTitle>
          <CardDescription>
            مدیریت آدرس‌های تحویل برای سفارش.
          </CardDescription>
          <CardAction>
            <Button type="button" onClick={openCreateDialog}>
              <Plus />
              افزودن آدرس
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {addresses.length === 0
            ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
                  <MapPin className="size-8 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">هنوز آدرسی ثبت نشده</p>
                    <p className="text-sm text-muted-foreground">
                      برای ثبت سفارش، حداقل یک آدرس تحویل اضافه کنید.
                    </p>
                  </div>
                  <Button type="button" onClick={openCreateDialog}>
                    <Plus />
                    افزودن اولین آدرس
                  </Button>
                </div>
              )
            : (
                addresses.map(address => (
                  <AddressListCard
                    key={address.id}
                    address={address}
                    onEdit={() => openEditDialog(address)}
                  />
                ))
              )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="flex max-h-[min(90vh,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
          onInteractOutside={(e) => {
            if (formDirty) {
              e.preventDefault()
            }
          }}
          onEscapeKeyDown={(e) => {
            if (formDirty) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader className="border-b px-4 py-4">
            <DialogTitle>
              {dialogMode === 'edit' ? 'ویرایش آدرس' : 'افزودن آدرس'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit'
                ? 'اطلاعات آدرس تحویل را ویرایش کنید.'
                : 'آدرس تحویل جدید برای سفارش‌های کفش ثبت کنید.'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-4">
            {dialogOpen && (
              <AddressForm
                key={
                  dialogMode === 'edit' && editingAddress
                    ? editingAddress.id
                    : 'create'
                }
                mode={dialogMode === 'edit' ? 'edit' : 'create'}
                address={editingAddress ?? undefined}
                onDirtyChange={setFormDirty}
                onCancel={closeDialog}
                onSuccess={closeDialog}
              />
            )}
          </div>
          {formDirty && (
            <div className="border-t bg-muted/40 px-4 py-2">
              <p className="text-xs text-muted-foreground">
                تغییرات ذخیره نشده دارید. برای بستن، ابتدا انصراف را بزنید.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
