import type { AddressFormValues } from '#/features/settings/addresses/address-form.values'

import { useForm } from '@tanstack/react-form'
import { addressFormSchema } from '#/orpc/schemas/address'

/** Type-only — mirrors `useForm` in `AddressForm`; never called. */
function _addressFormTypeHelper() {
  return useForm({
    defaultValues: {} as AddressFormValues,
    validators: {
      onChange: addressFormSchema,
      onBlur: addressFormSchema,
      onSubmit: addressFormSchema,
    },
  })
}

export type AddressForm = ReturnType<typeof _addressFormTypeHelper>
