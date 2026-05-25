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

/** True when the catalog defines at least one variant-option attribute (size, color, …). */
export function requiresCatalogVariantOptions(optionAttributeIds: string[]) {
  return optionAttributeIds.length > 0
}

/** Keep only options for catalog variant-option attributes; drop stale rows. */
export function normalizeVariantOptionInputs(
  optionValues: VariantOptionInput[],
  optionAttributeIds: string[],
): VariantOptionInput[] {
  if (optionAttributeIds.length === 0) {
    return []
  }

  const allowed = new Set(optionAttributeIds)
  return optionValues.filter(option => allowed.has(option.attributeId))
}

export function optionSignature(options: VariantOptionInput[]) {
  return [...options]
    .sort((a, b) => a.attributeId.localeCompare(b.attributeId))
    .map(option => `${option.attributeId}:${option.attributeValueId}`)
    .join('|')
}

export function hasDuplicateOptionSignatures(
  variants: Array<{ optionValues: VariantOptionInput[] }>,
  optionAttributeIds: string[],
) {
  if (!requiresCatalogVariantOptions(optionAttributeIds)) {
    return false
  }

  const signatures = variants.map(variant =>
    optionSignature(
      normalizeVariantOptionInputs(variant.optionValues, optionAttributeIds),
    ),
  )

  return new Set(signatures).size !== signatures.length
}

export function validateVariantOptionInputs(
  optionAttributeIds: string[],
  variants: Array<{ optionValues: VariantOptionInput[] }>,
) {
  const errors: string[] = []

  if (!requiresCatalogVariantOptions(optionAttributeIds)) {
    return errors
  }

  variants.forEach((variant, index) => {
    const normalized = normalizeVariantOptionInputs(
      variant.optionValues,
      optionAttributeIds,
    )
    const byAttribute = new Map(
      normalized.map(option => [option.attributeId, option]),
    )

    for (const attributeId of optionAttributeIds) {
      const selected = byAttribute.get(attributeId)
      if (!selected?.attributeValueId) {
        errors.push(
          `تنوع ${index + 1}: همه گزینه‌های تنوع (سایز، رنگ و …) باید انتخاب شوند.`,
        )
        break
      }
    }
  })

  if (hasDuplicateOptionSignatures(variants, optionAttributeIds)) {
    errors.push('دو تنوع با همان ترکیب گزینه‌ها مجاز نیست.')
  }

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
