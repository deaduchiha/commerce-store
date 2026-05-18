import type { UpdateProfileInput } from '#/orpc/schemas/profile'
import { useForm } from '@tanstack/react-form'
import { updateProfileInputSchema } from '#/orpc/schemas/profile'

/** Type-only — mirrors `useForm` in `ProfileCard`; never called. */
function _profileFormTypeHelper() {
  return useForm({
    defaultValues: {} as UpdateProfileInput,
    validators: {
      onChange: updateProfileInputSchema,
      onBlur: updateProfileInputSchema,
      onSubmit: updateProfileInputSchema,
    },
  })
}

export type ProfileForm = ReturnType<typeof _profileFormTypeHelper>
