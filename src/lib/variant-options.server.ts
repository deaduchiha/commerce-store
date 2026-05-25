import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '#/db'
import {
  attributes,
  attributeValues,
  variantAttributeValues,
} from '#/db/schema'

import type { VariantOptionInput, VariantOptionValue } from '#/lib/variant-options'

export type { VariantOptionInput, VariantOptionValue } from '#/lib/variant-options'

export async function loadVariantOptionsByVariantIds(variantIds: string[]) {
  const map = new Map<string, VariantOptionValue[]>()

  if (variantIds.length === 0) {
    return map
  }

  const rows = await db
    .select({
      variantId: variantAttributeValues.variantId,
      attributeId: variantAttributeValues.attributeId,
      attributeValueId: variantAttributeValues.attributeValueId,
      attributeCode: attributes.code,
      attributeName: attributes.name,
      value: attributeValues.value,
      colorHex: attributeValues.colorHex,
      valueText: variantAttributeValues.valueText,
    })
    .from(variantAttributeValues)
    .innerJoin(
      attributes,
      eq(variantAttributeValues.attributeId, attributes.id),
    )
    .leftJoin(
      attributeValues,
      eq(variantAttributeValues.attributeValueId, attributeValues.id),
    )
    .where(inArray(variantAttributeValues.variantId, variantIds))
    .orderBy(asc(attributes.sortOrder))

  for (const row of rows) {
    if (!row.attributeValueId) {
      continue
    }

    const option: VariantOptionValue = {
      attributeId: row.attributeId,
      attributeValueId: row.attributeValueId,
      attributeCode: row.attributeCode,
      attributeName: row.attributeName,
      value: row.value ?? row.valueText ?? '',
      colorHex: row.colorHex ?? null,
    }

    const list = map.get(row.variantId) ?? []
    list.push(option)
    map.set(row.variantId, list)
  }

  return map
}

export async function replaceVariantOptions(
  variantId: string,
  options: VariantOptionInput[],
) {
  await db
    .delete(variantAttributeValues)
    .where(eq(variantAttributeValues.variantId, variantId))

  if (options.length === 0) {
    return
  }

  await db.insert(variantAttributeValues).values(
    options.map(option => ({
      variantId,
      attributeId: option.attributeId,
      attributeValueId: option.attributeValueId,
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      valueJson: null,
    })),
  )
}

export async function listVariantOptionAttributeIds() {
  const rows = await db
    .select({ id: attributes.id })
    .from(attributes)
    .where(eq(attributes.isVariantOption, true))
    .orderBy(asc(attributes.sortOrder))

  return rows.map(row => row.id)
}
