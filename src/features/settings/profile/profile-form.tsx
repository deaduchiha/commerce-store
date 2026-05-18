import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { ProfileFormFields } from '#/features/settings/profile/profile-form-fields'
import {
  type Profile,
  updateProfileInputSchema,
} from '#/features/settings/profile/profile.schema'
import { orpc } from '#/orpc/client'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient()
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const updateMutation = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.profile.get.key(),
        })
        setSavedMessage('تغییرات با موفقیت ذخیره شد.')
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: profile.name,
    },
    validators: {
      onSubmit: updateProfileInputSchema,
    },
    onSubmit: async ({ value }) => {
      setSavedMessage(null)
      await updateMutation.mutateAsync(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="max-w-lg"
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>اطلاعات حساب</FieldLegend>
          <ProfileFormFields
            form={form}
            phoneNumber={profile.phoneNumber}
          />
        </FieldSet>

        {savedMessage && (
          <p className="text-sm text-primary">{savedMessage}</p>
        )}

        {updateMutation.isError && (
          <p className="text-sm text-destructive">
            {updateMutation.error.message ?? 'ذخیره‌سازی ناموفق بود.'}
          </p>
        )}

        <Button
          type="submit"
          disabled={updateMutation.isPending || !form.state.canSubmit}
        >
          {updateMutation.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
        </Button>
      </FieldGroup>
    </form>
  )
}
