import type { AddressForm } from '#/features/settings/addresses/address-form.types'
import {
  Field,
  FieldLabel,
} from '#/components/ui/field'
import { Switch } from '#/components/ui/switch'
import { ADDRESS_LABEL_OPTIONS } from '#/features/settings/addresses/address.constants'
import { FormSelectField } from '#/features/settings/components/form-select-field'
import { FormTextField } from '#/features/settings/components/form-text-field'

interface AddressFormFieldsProps {
  form: AddressForm
  showDefaultToggle?: boolean
}

export function AddressFormFields({
  form,
  showDefaultToggle = true,
}: AddressFormFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <form.Field name="label">
        {field => (
          <FormSelectField
            field={field}
            label="نوع آدرس"
            options={[...ADDRESS_LABEL_OPTIONS]}
            placeholder="انتخاب کنید"
          />
        )}
      </form.Field>

      <form.Field name="recipientName">
        {field => (
          <FormTextField
            field={field}
            label="نام گیرنده"
            placeholder="نام و نام خانوادگی"
            autoComplete="name"
          />
        )}
      </form.Field>

      <form.Field name="recipientPhone">
        {field => (
          <FormTextField
            field={field}
            label="شماره تماس گیرنده"
            placeholder="09123456789"
            autoComplete="tel"
            type="tel"
          />
        )}
      </form.Field>

      <form.Field name="province">
        {field => (
          <FormTextField
            field={field}
            label="استان"
            placeholder="تهران"
          />
        )}
      </form.Field>

      <form.Field name="city">
        {field => (
          <FormTextField
            field={field}
            label="شهر"
            placeholder="تهران"
          />
        )}
      </form.Field>

      <form.Field name="district">
        {field => (
          <FormTextField
            field={field}
            label="منطقه / محله"
            placeholder="اختیاری"
          />
        )}
      </form.Field>

      <form.Field name="postalCode">
        {field => (
          <FormTextField
            field={field}
            label="کد پستی"
            placeholder="1234567890"
            type="text"
          />
        )}
      </form.Field>

      <form.Field name="plateNumber">
        {field => (
          <FormTextField
            field={field}
            label="پلاک"
            placeholder="اختیاری"
          />
        )}
      </form.Field>

      <form.Field name="unit">
        {field => (
          <FormTextField
            field={field}
            label="واحد"
            placeholder="اختیاری"
          />
        )}
      </form.Field>

      <form.Field name="nationalCode">
        {field => (
          <FormTextField
            field={field}
            label="کد ملی"
            placeholder="اختیاری"
          />
        )}
      </form.Field>

      <form.Field name="streetAddress">
        {field => (
          <div className="sm:col-span-2">
            <FormTextField
              field={field}
              label="آدرس کامل"
              placeholder="خیابان، کوچه، ساختمان"
            />
          </div>
        )}
      </form.Field>

      {showDefaultToggle && (
        <form.Field name="isDefault">
          {field => (
            <Field
              orientation="horizontal"
              className="sm:col-span-2"
            >
              <Switch
                id="isDefault"
                checked={field.state.value ?? false}
                onCheckedChange={checked => field.handleChange(checked)}
              />
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="isDefault">آدرس پیش‌فرض</FieldLabel>
              </div>
            </Field>
          )}
        </form.Field>
      )}
    </div>
  )
}
