import type { AdminCategory } from '#/orpc/schemas/admin/catalog'

import { arrayMove } from '@dnd-kit/sortable'

export type CategoryTreeInput = Pick<
  AdminCategory,
  'id' | 'name' | 'parentId' | 'sortOrder'
>

export interface CategoryTreeOption extends CategoryTreeInput {
  depth: number
  label: string
}

export interface CategoryTreeNode {
  category: AdminCategory
  children: CategoryTreeNode[]
}

function compareCategories(left: CategoryTreeInput, right: CategoryTreeInput) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder
  }

  return left.name.localeCompare(right.name, 'fa')
}

export function getCategorySiblings(
  categories: CategoryTreeInput[],
  parentId: string | null,
) {
  return categories
    .filter(category => (category.parentId ?? null) === parentId)
    .sort(compareCategories)
}

export function reorderSiblingIds(
  ids: string[],
  activeId: string,
  overId: string,
) {
  const oldIndex = ids.indexOf(activeId)
  const newIndex = ids.indexOf(overId)

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return ids
  }

  return arrayMove(ids, oldIndex, newIndex)
}

export function applyCategoryReorder(
  categories: AdminCategory[],
  parentId: string | null,
  orderedIds: string[],
) {
  const orderById = new Map(orderedIds.map((id, index) => [id, index]))

  return categories.map((category) => {
    if ((category.parentId ?? null) !== parentId) {
      return category
    }

    const nextOrder = orderById.get(category.id)
    if (nextOrder === undefined) {
      return category
    }

    return { ...category, sortOrder: nextOrder }
  })
}

function groupCategoriesByParent(categories: CategoryTreeInput[]) {
  const byParent = new Map<string | null, CategoryTreeInput[]>()

  for (const category of categories) {
    const parentKey = category.parentId ?? null
    const siblings = byParent.get(parentKey) ?? []
    siblings.push(category)
    byParent.set(parentKey, siblings)
  }

  for (const siblings of byParent.values()) {
    siblings.sort(compareCategories)
  }

  return byParent
}

export function buildCategoryTree(categories: AdminCategory[]): CategoryTreeNode[] {
  const byParent = groupCategoriesByParent(categories)
  const byId = new Map(categories.map(category => [category.id, category]))

  function walk(parentId: string | null): CategoryTreeNode[] {
    return (byParent.get(parentId) ?? []).map((item) => {
      const category = byId.get(item.id)
      if (!category) {
        throw new Error(`Category ${item.id} not found`)
      }

      return {
        category,
        children: walk(item.id),
      }
    })
  }

  return walk(null)
}

export function getDefaultExpandedRootIds(tree: CategoryTreeNode[]): string[] {
  return tree
    .filter(node => node.children.length > 0)
    .map(node => node.category.id)
}

export function collectAncestorIds(
  categories: Array<{ id: string, parentId: string | null }>,
  matchIds: string[],
) {
  const byId = new Map(categories.map(category => [category.id, category]))
  const ancestors = new Set<string>()

  for (const matchId of matchIds) {
    let parentId = byId.get(matchId)?.parentId ?? null

    while (parentId) {
      ancestors.add(parentId)
      parentId = byId.get(parentId)?.parentId ?? null
    }
  }

  return [...ancestors]
}

export function filterCategoryTree(
  tree: CategoryTreeNode[],
  visibleIds: Set<string>,
): CategoryTreeNode[] {
  return tree
    .filter(node => visibleIds.has(node.category.id))
    .map(node => ({
      category: node.category,
      children: filterCategoryTree(node.children, visibleIds),
    }))
}

export function collectVisibleIdsForSearch(
  allCategories: AdminCategory[],
  matches: AdminCategory[],
) {
  const matchIds = new Set(matches.map(match => match.id))
  const visible = new Set(matchIds)

  for (const matchId of matchIds) {
    for (const ancestorId of collectAncestorIds(allCategories, [matchId])) {
      visible.add(ancestorId)
    }
  }

  return visible
}

export function buildCategoryTreeOptions(categories: CategoryTreeInput[]) {
  const byParent = groupCategoriesByParent(categories)

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
