import type { Address } from '#/orpc/schemas/address'

export const ADDRESS_LABEL_OPTIONS = [
  { value: 'home', label: 'منزل' },
  { value: 'work', label: 'محل کار' },
] as const

export function getAddressLabel(label: Address['label']) {
  return ADDRESS_LABEL_OPTIONS.find(option => option.value === label)?.label
    ?? label
}
