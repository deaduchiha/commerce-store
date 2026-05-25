import type { AdminCategory } from '#/orpc/schemas/admin/catalog'

export type CategoryTreeInput = Pick<
  AdminCategory,
  'id' | 'name' | 'parentId' | 'sortOrder'
>

export interface CategoryTreeOption extends CategoryTreeInput {
  depth: number
  label: string
}

export function buildCategoryTreeOptions(categories: CategoryTreeInput[]) {
  const byParent = new Map<string | null, CategoryTreeInput[]>()

  for (const category of categories) {
    const parentKey = category.parentId ?? null
    const siblings = byParent.get(parentKey) ?? []
    siblings.push(category)
    byParent.set(parentKey, siblings)
  }

  for (const siblings of byParent.values()) {
    siblings.sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder
      }

      return left.name.localeCompare(right.name, 'fa')
    })
  }

  const options: CategoryTreeOption[] = []

  function walk(parentId: string | null, depth: number) {
    for (const category of byParent.get(parentId) ?? []) {
      const prefix = depth > 0 ? `${'— '.repeat(depth)}` : ''
      options.push({
        ...category,
        depth,
        label: `${prefix}${category.name}`,
      })
      walk(category.id, depth + 1)
    }
  }

  walk(null, 0)

  return options
}
