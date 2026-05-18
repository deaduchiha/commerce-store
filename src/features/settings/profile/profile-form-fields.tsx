import type { ProfileForm } from '#/features/settings/profile/profile-form.types'
import { FormTextField } from '#/features/settings/components/form-text-field'

interface ProfileFormFieldsProps {
  form: ProfileForm
}

export function ProfileFormFields({ form }: ProfileFormFieldsProps) {
  return (
    <div className="flex flex-col gap-5 max-w-sm">
      <form.Field name="name">
        {field => (
          <FormTextField
            field={field}
            label="نام و نام خانوادگی"
            placeholder="مثال: علی رضایی"
            autoComplete="name"
          />
        )}
      </form.Field>

    </div>
  )
}
