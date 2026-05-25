export interface VariantOptionValue {
  attributeId: string
  attributeValueId: string
  attributeCode: string
  attributeName: string
  value: string
  colorHex: string | null
}

export interface VariantOptionInput {
  attributeId: string
  attributeValueId: string
}

export function optionSignature(options: VariantOptionInput[]) {
  return [...options]
    .sort((a, b) => a.attributeId.localeCompare(b.attributeId))
    .map(option => `${option.attributeId}:${option.attributeValueId}`)
    .join('|')
}

export function validateVariantOptionInputs(
  optionAttributeIds: string[],
  variants: Array<{ optionValues: VariantOptionInput[] }>,
) {
  const errors: string[] = []

  if (optionAttributeIds.length === 0) {
    return errors
  }

  const signatures = new Set<string>()

  variants.forEach((variant, index) => {
    const byAttribute = new Map(
      variant.optionValues.map(option => [option.attributeId, option]),
    )

    for (const attributeId of optionAttributeIds) {
      const selected = byAttribute.get(attributeId)
      if (!selected?.attributeValueId) {
        errors.push(`تنوع ${index + 1}: همه گزینه‌های تنوع (سایز، رنگ و …) باید انتخاب شوند.`)
        break
      }
    }

    const signature = optionSignature(variant.optionValues)
    if (signature && signatures.has(signature)) {
      errors.push(`تنوع ${index + 1}: ترکیب سایز/رنگ با تنوع دیگر تکراری است.`)
    }
    else if (signature) {
      signatures.add(signature)
    }
  })

  return errors
}

/** Resolve size/color labels for order snapshots. */
export function pickOptionLabels(
  options: VariantOptionValue[],
  codes: { size?: string, color?: string } = { size: 'size', color: 'color' },
) {
  const size = options.find(option => option.attributeCode === codes.size)?.value ?? ''
  const color = options.find(option => option.attributeCode === codes.color)?.value ?? ''
  return { size, color }
}
