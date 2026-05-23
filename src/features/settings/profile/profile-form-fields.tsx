import type { ProfileForm } from '#/features/settings/profile/profile-form.types'
import { FormDatePicker } from '#/features/settings/components/form-date-picker'
import { FormTextField } from '#/features/settings/components/form-text-field'
import { ProfileGenderField } from '#/features/settings/profile/profile-gender-field'

interface ProfileFormFieldsProps {
  form: ProfileForm
}

export function ProfileFormFields({ form }: ProfileFormFieldsProps) {
  return (
    <div className="grid-cols-2 grid gap-5">
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

      <form.Field name="gender">
        {field => <ProfileGenderField field={field} />}
      </form.Field>

      <form.Field name="birthday">
        {field => (
          <FormDatePicker
            field={field}
            label="تاریخ تولد"
            placeholder="انتخاب تاریخ تولد"
          />
        )}
      </form.Field>
    </div>
  )
}
