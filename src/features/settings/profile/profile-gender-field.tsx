import type { AnyFieldApi } from '@tanstack/react-form'

import {
  Field,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useShowFieldError } from '#/features/settings/components/field-validation'
import { PROFILE_GENDER_OPTIONS } from '#/features/settings/profile/profile.constants'

interface ProfileGenderFieldProps {
  field: AnyFieldApi
}

export function ProfileGenderField({ field }: ProfileGenderFieldProps) {
  const showError = useShowFieldError(field)
  const value = field.state.value ? String(field.state.value) : 'none'

  return (
    <Field data-invalid={showError}>
      <FieldLabel>جنسیت</FieldLabel>
      <Select
        value={value}
        onValueChange={(next) => {
          field.handleChange(next === 'none' ? '' : next)
          field.handleBlur()
        }}
      >
        <SelectTrigger className="w-full" aria-invalid={showError}>
          <SelectValue placeholder="انتخاب کنید" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">انتخاب نشده</SelectItem>
          {PROFILE_GENDER_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
