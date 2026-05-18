import type { AnyFieldApi } from '@tanstack/react-form'

import {
  Field,
  FieldDescription,
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

interface SelectOption {
  value: string
  label: string
}

interface FormSelectFieldProps {
  field: AnyFieldApi
  label: string
  description?: string
  options: SelectOption[]
  placeholder?: string
}

export function FormSelectField({
  field,
  label,
  description,
  options,
  placeholder,
}: FormSelectFieldProps) {
  const showError = useShowFieldError(field)

  return (
    <Field data-invalid={showError}>
      <FieldLabel>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Select
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value)
          field.handleBlur()
        }}
      >
        <SelectTrigger className="w-full" aria-invalid={showError}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
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
