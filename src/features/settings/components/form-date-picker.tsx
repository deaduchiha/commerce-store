import type { AnyFieldApi } from '@tanstack/react-form'
import { format, parseISO } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { useShowFieldError } from '#/features/settings/components/field-validation'
import { cn } from '#/lib/utils'

interface FormDatePickerProps {
  field: AnyFieldApi
  label: string
  description?: string
  placeholder?: string
  fromYear?: number
  toYear?: number
}

export function FormDatePicker({
  field,
  label,
  description,
  placeholder = 'انتخاب تاریخ',
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: FormDatePickerProps) {
  const showError = useShowFieldError(field)
  const selected = field.state.value ? parseISO(field.state.value) : undefined

  return (
    <Field data-invalid={showError}>
      <FieldLabel>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            data-empty={!field.state.value}
            className={cn(
              'w-full justify-start text-start font-normal',
              'data-[empty=true]:text-muted-foreground',
            )}
            aria-invalid={showError}
          >
            <CalendarIcon className="size-4" />
            {selected
              ? format(selected, 'd MMMM yyyy', { locale: faIR })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')
              field.handleBlur()
            }}
            disabled={date =>
              date > new Date() || date < new Date(`${fromYear}-01-01`)}
            startMonth={new Date(fromYear, 0)}
            endMonth={new Date(toYear, 11)}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {field.state.value
        ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-0 text-muted-foreground"
              onClick={() => {
                field.handleChange('')
                field.handleBlur()
              }}
            >
              پاک کردن تاریخ
            </Button>
          )
        : null}
      {showError && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
