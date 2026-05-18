import type { ProfileFormValues } from '#/features/settings/profile/profile-form.values'

import { useForm } from '@tanstack/react-form'
import { profileFormSchema } from '#/orpc/schemas/profile'

/** Type-only — mirrors `useForm` in `ProfileCard`; never called. */
function _profileFormTypeHelper() {
  return useForm({
    defaultValues: {} as ProfileFormValues,
    validators: {
      onChange: profileFormSchema,
      onBlur: profileFormSchema,
      onSubmit: profileFormSchema,
    },
  })
}

export type ProfileForm = ReturnType<typeof _profileFormTypeHelper>
