import type { FormApi } from '@tanstack/react-form'

import {
  Field,
  FieldDescription,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { FormTextField } from '#/features/settings/components/form-text-field'
import type { UpdateProfileInput } from '#/features/settings/profile/profile.schema'

interface ProfileFormFieldsProps {
  form: FormApi<UpdateProfileInput, undefined>
  phoneNumber: string | null
}

export function ProfileFormFields({ form, phoneNumber }: ProfileFormFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <form.Field name="name">
        {field => (
          <FormTextField
            field={field}
            label="نام نمایشی"
            description="این نام در سفارش‌ها و پیام‌های فروشگاه نمایش داده می‌شود."
            placeholder="مثال: علی رضایی"
            autoComplete="name"
          />
        )}
      </form.Field>

      <Field>
        <FieldLabel htmlFor="phoneNumber">شماره موبایل</FieldLabel>
        <FieldDescription>
          برای ورود و اطلاع‌رسانی سفارش استفاده می‌شود. از تنظیمات پروفایل قابل تغییر نیست.
        </FieldDescription>
        <Input
          id="phoneNumber"
          value={phoneNumber ?? '—'}
          disabled
          readOnly
        />
      </Field>
    </div>
  )
}
