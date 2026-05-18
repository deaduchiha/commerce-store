import type { AnyFieldApi } from '@tanstack/react-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { useShowFieldError } from '#/features/settings/components/field-validation'

interface FormTextFieldProps {
  field: AnyFieldApi
  label: string
  description?: string
  type?: React.HTMLInputTypeAttribute
  disabled?: boolean
  placeholder?: string
  autoComplete?: string
}

export function FormTextField({
  field,
  label,
  description,
  type = 'text',
  disabled,
  placeholder,
  autoComplete,
}: FormTextFieldProps) {
  const showError = useShowFieldError(field)

  return (
    <Field data-invalid={showError}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={showError}
      />
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
