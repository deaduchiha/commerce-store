import type { DragEndEvent } from '@dnd-kit/core'
import type { CategoryTreeNode } from '#/lib/catalog-categories'
import type { AdminCategory } from '#/orpc/schemas/admin/catalog'

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronDown,
  ChevronLeft,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  buildCategoryTree,
  collectAncestorIds,
  collectVisibleIdsForSearch,
  filterCategoryTree,
  getCategorySiblings,
  getDefaultExpandedRootIds,
  reorderSiblingIds,
} from '#/lib/catalog-categories'
import { cn } from '#/lib/utils'

function collectExpandableIds(tree: CategoryTreeNode[]): string[] {
  const ids: string[] = []

  function walk(nodes: CategoryTreeNode[]) {
    for (const node of nodes) {
      if (node.children.length > 0) {
        ids.push(node.category.id)
        walk(node.children)
      }
    }
  }

  walk(tree)
  return ids
}

function CategoryTreeRow({
  node,
  depth,
  expanded,
  sortableEnabled,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  node: CategoryTreeNode
  depth: number
  expanded: boolean
  sortableEnabled: boolean
  onToggleExpand: () => void
  onEdit: (item: AdminCategory) => void
  onDelete: (item: AdminCategory) => void
}) {
  const { category, children } = node
  const hasChildren = children.length > 0
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    disabled: !sortableEnabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 border-b px-3 py-2.5 last:border-b-0',
        isDragging && 'relative z-10 bg-muted/80 shadow-sm',
        depth === 0 && 'bg-muted/20',
      )}
    >
      <div
        className="flex shrink-0 items-center gap-1"
        style={{ paddingInlineStart: `${depth * 1.25}rem` }}
      >
        {hasChildren
          ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground size-8 shrink-0"
                aria-expanded={expanded}
                aria-label={expanded ? `بستن ${category.name}` : `باز کردن ${category.name}`}
                onClick={onToggleExpand}
              >
                {expanded
                  ? <ChevronDown className="size-4" />
                  : <ChevronLeft className="size-4 rtl:rotate-180" />}
              </Button>
            )
          : (
              <span className="inline-block size-8 shrink-0" aria-hidden />
            )}
        {sortableEnabled
          ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
                aria-label={`جابه‌جایی ${category.name}`}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="size-4" />
              </Button>
            )
          : (
              <span className="inline-block size-8 shrink-0" aria-hidden />
            )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn('truncate', depth === 0 ? 'font-semibold' : 'font-medium')}>
            {category.name}
          </span>
          {hasChildren && !expanded && (
            <span className="text-muted-foreground text-xs">
              {children.length.toLocaleString('fa-IR')}
              {' '}
              زیردسته
            </span>
          )}
        </div>
        <p className="text-muted-foreground truncate text-xs" dir="ltr">
          {category.slug}
        </p>
      </div>

      <Badge
        variant={category.isActive ? 'default' : 'secondary'}
        className="hidden shrink-0 sm:inline-flex"
      >
        {category.isActive ? 'فعال' : 'غیرفعال'}
      </Badge>

      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onEdit(category)}
        >
          <Pencil />
          <span className="sr-only">ویرایش دسته‌بندی</span>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          onClick={() => onDelete(category)}
        >
          <Trash2 />
          <span className="sr-only">حذف دسته‌بندی</span>
        </Button>
      </div>
    </div>
  )
}

function CategorySiblingList({
  nodes,
  depth,
  expandedIds,
  sortableEnabled,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  nodes: CategoryTreeNode[]
  depth: number
  expandedIds: Set<string>
  sortableEnabled: boolean
  onToggleExpand: (id: string) => void
  onEdit: (item: AdminCategory) => void
  onDelete: (item: AdminCategory) => void
}) {
  const sortableIds = nodes.map(node => node.category.id)

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      {nodes.map((node) => {
        const expanded = expandedIds.has(node.category.id)

        return (
          <div key={node.category.id}>
            <CategoryTreeRow
              node={node}
              depth={depth}
              expanded={expanded}
              sortableEnabled={sortableEnabled}
              onToggleExpand={() => onToggleExpand(node.category.id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            {expanded && node.children.length > 0 && (
              <CategorySiblingList
                nodes={node.children}
                depth={depth + 1}
                expandedIds={expandedIds}
                sortableEnabled={sortableEnabled}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        )
      })}
    </SortableContext>
  )
}

export function CategoriesTreeList({
  items,
  allItems,
  isLoading,
  emptyMessage = 'موردی ثبت نشده است.',
  sortableEnabled,
  isSearchActive,
  searchHint,
  onEdit,
  onDelete,
  onReorder,
}: {
  items: AdminCategory[]
  allItems: AdminCategory[]
  isLoading: boolean
  emptyMessage?: string
  sortableEnabled: boolean
  isSearchActive: boolean
  searchHint?: string
  onEdit: (item: AdminCategory) => void
  onDelete: (item: AdminCategory) => void
  onReorder: (input: {
    parentId: string | null
    orderedIds: string[]
  }) => void
}) {
  const fullTree = useMemo(() => buildCategoryTree(allItems), [allItems])

  const displayTree = useMemo(() => {
    if (!isSearchActive) {
      return fullTree
    }

    const visibleIds = collectVisibleIdsForSearch(allItems, items)
    return filterCategoryTree(fullTree, visibleIds)
  }, [allItems, fullTree, isSearchActive, items])

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const hasInitializedExpand = useRef(false)
  const wasSearchActive = useRef(isSearchActive)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (isSearchActive) {
      const matchIds = items.map(item => item.id)
      const ancestors = collectAncestorIds(allItems, matchIds)
      setExpandedIds(new Set([...ancestors, ...matchIds]))
      wasSearchActive.current = true
      return
    }

    if (wasSearchActive.current) {
      setExpandedIds(new Set(getDefaultExpandedRootIds(fullTree)))
      wasSearchActive.current = false
      return
    }

    if (!hasInitializedExpand.current) {
      setExpandedIds(new Set(getDefaultExpandedRootIds(fullTree)))
      hasInitializedExpand.current = true
    }
  }, [allItems, fullTree, isLoading, isSearchActive, items])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function toggleExpand(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      }
      else {
        next.add(id)
      }
      return next
    })
  }

  function expandAll() {
    setExpandedIds(new Set(collectExpandableIds(displayTree)))
  }

  function collapseAll() {
    setExpandedIds(new Set())
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const activeCategory = allItems.find(item => item.id === active.id)
    const overCategory = allItems.find(item => item.id === over.id)

    if (!activeCategory || !overCategory) {
      return
    }

    const activeParentId = activeCategory.parentId ?? null
    const overParentId = overCategory.parentId ?? null

    if (activeParentId !== overParentId) {
      toast.error('فقط ترتیب هم‌سطح‌ها قابل تغییر است.')
      return
    }

    const siblingIds = getCategorySiblings(allItems, activeParentId).map(
      sibling => sibling.id,
    )
    const orderedIds = reorderSiblingIds(
      siblingIds,
      String(active.id),
      String(over.id),
    )

    if (orderedIds.every((id, index) => id === siblingIds[index])) {
      return
    }

    onReorder({ parentId: activeParentId, orderedIds })
  }

  if (isLoading) {
    return <Skeleton className="h-56 w-full" />
  }

  if (displayTree.length === 0) {
    return (
      <div className="text-muted-foreground flex h-24 items-center justify-center border text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={expandAll}>
            باز کردن همه
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
            بستن همه
          </Button>
        </div>
        {searchHint && (
          <p className="text-muted-foreground text-sm">{searchHint}</p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden border">
          <CategorySiblingList
            nodes={displayTree}
            depth={0}
            expandedIds={expandedIds}
            sortableEnabled={sortableEnabled}
            onToggleExpand={toggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </DndContext>
    </div>
  )
}
