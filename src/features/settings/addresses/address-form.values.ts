import type { Address, AddressFormValues } from '#/orpc/schemas/address'

export type { AddressFormValues }

export function toAddressFormValues(address?: Address): AddressFormValues {
  if (!address) {
    return {
      label: 'home',
      recipientName: '',
      recipientPhone: '',
      province: '',
      city: '',
      district: '',
      streetAddress: '',
      plateNumber: '',
      unit: '',
      postalCode: '',
      nationalCode: '',
      isDefault: false,
    }
  }

  return {
    label: address.label,
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    province: address.province,
    city: address.city,
    district: address.district ?? '',
    streetAddress: address.streetAddress,
    plateNumber: address.plateNumber ?? '',
    unit: address.unit ?? '',
    postalCode: address.postalCode,
    nationalCode: address.nationalCode ?? '',
    isDefault: address.isDefault,
  }
}
