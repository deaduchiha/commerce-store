export type VariantLegacyField = 'size' | 'color'

export function variantLegacyFieldForAttribute(attribute: {
  code: string
  name: string
}): VariantLegacyField | null {
  const key = `${attribute.code} ${attribute.name}`.toLowerCase()

  if (
    key.includes('size')
    || key.includes('سایز')
    || key.includes('اندازه')
  ) {
    return 'size'
  }

  if (
    key.includes('color')
    || key.includes('colour')
    || key.includes('رنگ')
  ) {
    return 'color'
  }

  return null
}
