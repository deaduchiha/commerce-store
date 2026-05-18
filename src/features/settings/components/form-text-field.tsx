import type { AnyFieldApi } from '@tanstack/react-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'

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
  const isInvalid
    = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
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
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
