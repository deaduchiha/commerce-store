import type { Address } from '#/orpc/schemas/address'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button'
import { AddressFormFields } from '#/features/settings/addresses/address-form-fields'
import { toAddressFormValues } from '#/features/settings/addresses/address-form.values'
import { ConfirmDialog } from '#/features/settings/components/confirm-dialog'
import { FormStatus } from '#/features/settings/components/form-status'
import { orpc } from '#/orpc/client'
import { addressFormSchema } from '#/orpc/schemas/address'

interface AddressFormProps {
  mode: 'create' | 'edit'
  address?: Address
  onCancel: () => void
  onSuccess?: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

export function AddressForm({
  mode,
  address,
  onCancel,
  onSuccess,
  onDirtyChange,
}: AddressFormProps) {
  const queryClient = useQueryClient()
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const createMutation = useMutation(
    orpc.address.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.address.list.key(),
        })
        setSavedMessage('آدرس با موفقیت اضافه شد.')
        onSuccess?.()
      },
    }),
  )

  const updateMutation = useMutation(
    orpc.address.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.address.list.key(),
        })
        setSavedMessage('آدرس با موفقیت به‌روزرسانی شد.')
        onSuccess?.()
      },
    }),
  )

  const mutation = mode === 'create' ? createMutation : updateMutation

  const form = useForm({
    defaultValues: toAddressFormValues(address),
    validators: {
      onChange: addressFormSchema,
      onBlur: addressFormSchema,
      onSubmit: addressFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSavedMessage(null)

      if (mode === 'create') {
        await createMutation.mutateAsync(value)
        return
      }

      if (!address) {
        return
      }

      await updateMutation.mutateAsync({
        id: address.id,
        data: value,
      })
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty, onDirtyChange])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <AddressFormFields form={form} />
      <FormStatus
        successMessage={savedMessage}
        errorMessage={
          mutation.isError
            ? mutation.error.message ?? 'ذخیره‌سازی ناموفق بود.'
            : null
        }
      />
      <div className="flex flex-wrap justify-end gap-2">
        {form.state.isDirty
          ? (
              <ConfirmDialog
                title="لغو تغییرات"
                description="تغییرات ذخیره نشده از بین می‌رود. مطمئن هستید؟"
                confirmLabel="لغو تغییرات"
                confirmVariant="destructive"
                onConfirm={() => onCancel()}
                trigger={(
                  <Button
                    type="button"
                    variant="outline"
                    disabled={mutation.isPending}
                  >
                    انصراف
                  </Button>
                )}
              />
            )
          : (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={mutation.isPending}
              >
                انصراف
              </Button>
            )}
        <Button
          type="submit"
          disabled={mutation.isPending || !form.state.canSubmit}
        >
          {mutation.isPending
            ? 'در حال ذخیره…'
            : mode === 'create'
              ? 'افزودن آدرس'
              : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  )
}
