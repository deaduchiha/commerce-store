import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import type { CategoryTreeNode } from '#/lib/catalog-categories'
import type { AdminCategory } from '#/orpc/schemas/admin/catalog'

import {
  closestCenter,
  DndContext,
  DragOverlay,
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

type DropHint = 'valid' | 'invalid'

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

function findTreeNode(
  nodes: CategoryTreeNode[],
  id: string,
): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.category.id === id) {
      return node
    }

    const child = findTreeNode(node.children, id)
    if (child) {
      return child
    }
  }

  return null
}

function getDropHint(
  allItems: AdminCategory[],
  activeId: string | null,
  overId: string | null,
): DropHint | null {
  if (!activeId || !overId || activeId === overId) {
    return null
  }

  const activeCategory = allItems.find(item => item.id === activeId)
  const overCategory = allItems.find(item => item.id === overId)

  if (!activeCategory || !overCategory) {
    return null
  }

  const activeParentId = activeCategory.parentId ?? null
  const overParentId = overCategory.parentId ?? null

  return activeParentId === overParentId ? 'valid' : 'invalid'
}

function CategoryRowPreview({
  node,
  depth,
}: {
  node: CategoryTreeNode
  depth: number
}) {
  const { category, children } = node
  const hasChildren = children.length > 0

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-primary/40 bg-background px-3 py-2.5 shadow-lg',
        'ring-2 ring-primary/20',
      )}
      style={{ paddingInlineStart: `calc(0.75rem + ${depth * 1.25}rem)` }}
    >
      <GripVertical className="text-muted-foreground size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="truncate font-medium">{category.name}</span>
        <p className="text-muted-foreground truncate text-xs" dir="ltr">
          {category.slug}
        </p>
      </div>
      {hasChildren && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {children.length.toLocaleString('fa-IR')}
          {' '}
          زیردسته
        </span>
      )}
    </div>
  )
}

function CategoryTreeRow({
  node,
  depth,
  expanded,
  sortableEnabled,
  dropHint,
  isDragSource,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  node: CategoryTreeNode
  depth: number
  expanded: boolean
  sortableEnabled: boolean
  dropHint: DropHint | null
  isDragSource: boolean
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

  const showPlaceholder = isDragging || isDragSource

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2.5 transition-colors',
        showPlaceholder && 'opacity-35',
        dropHint === 'valid'
        && 'z-10 rounded-md border-2 border-dashed border-primary bg-primary/5 ring-1 ring-primary/20',
        dropHint === 'invalid'
        && 'z-10 rounded-md border-2 border-dashed border-destructive bg-destructive/5 ring-1 ring-destructive/25',
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
                className={cn(
                  'text-muted-foreground size-8 shrink-0 touch-none',
                  isDragSource ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing',
                )}
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
        {dropHint === 'invalid' && (
          <p className="text-destructive mt-1 text-xs">
            فقط هم‌سطح‌ها قابل جابه‌جایی هستند
          </p>
        )}
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
  activeDragId,
  overDragId,
  allItems,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  nodes: CategoryTreeNode[]
  depth: number
  expandedIds: Set<string>
  sortableEnabled: boolean
  activeDragId: string | null
  overDragId: string | null
  allItems: AdminCategory[]
  onToggleExpand: (id: string) => void
  onEdit: (item: AdminCategory) => void
  onDelete: (item: AdminCategory) => void
}) {
  const sortableIds = nodes.map(node => node.category.id)
  const isNested = depth > 0

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      <div
        className={cn(
          isNested
          && 'border-s-2 border-border/60 bg-muted/20 divide-y divide-border/50',
          isNested && 'ms-3 me-2 mb-2 mt-0.5 overflow-hidden rounded-md',
        )}
      >
        {nodes.map((node, index) => {
          const expanded = expandedIds.has(node.category.id)
          const isLast = index === nodes.length - 1
          const dropHint = overDragId === node.category.id
            && activeDragId !== node.category.id
            ? getDropHint(allItems, activeDragId, overDragId)
            : null

          return (
            <div
              key={node.category.id}
              className={cn(
                depth === 0 && 'border-b border-border/60 last:border-b-0',
                depth === 0 && isLast && 'rounded-b-md',
              )}
            >
              <CategoryTreeRow
                node={node}
                depth={depth}
                expanded={expanded}
                sortableEnabled={sortableEnabled}
                dropHint={dropHint}
                isDragSource={activeDragId === node.category.id}
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
                  activeDragId={activeDragId}
                  overDragId={overDragId}
                  allItems={allItems}
                  onToggleExpand={onToggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>
          )
        })}
      </div>
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
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overDragId, setOverDragId] = useState<string | null>(null)
  const [activeDragDepth, setActiveDragDepth] = useState(0)
  const hasInitializedExpand = useRef(false)
  const wasSearchActive = useRef(isSearchActive)

  const activeDragNode = useMemo(
    () => (activeDragId ? findTreeNode(displayTree, activeDragId) : null),
    [activeDragId, displayTree],
  )

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

  function clearDragState() {
    setActiveDragId(null)
    setOverDragId(null)
    setActiveDragDepth(0)
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveDragId(id)
    setOverDragId(id)

    const category = allItems.find(item => item.id === id)
    if (!category) {
      setActiveDragDepth(0)
      return
    }

    let depth = 0
    let parentId = category.parentId ?? null
    while (parentId) {
      depth += 1
      parentId = allItems.find(item => item.id === parentId)?.parentId ?? null
    }
    setActiveDragDepth(depth)
  }

  function handleDragOver(event: DragOverEvent) {
    setOverDragId(event.over ? String(event.over.id) : null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    clearDragState()

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

  function handleDragCancel() {
    clearDragState()
  }

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

  if (isLoading) {
    return <Skeleton className="h-56 w-full" />
  }

  if (displayTree.length === 0) {
    return (
      <div className="text-muted-foreground flex h-24 items-center justify-center rounded-lg border bg-card text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
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
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className={cn(
            'overflow-hidden rounded-lg border bg-card shadow-sm',
            activeDragId && 'ring-1 ring-border',
          )}
        >
          <CategorySiblingList
            nodes={displayTree}
            depth={0}
            expandedIds={expandedIds}
            sortableEnabled={sortableEnabled}
            activeDragId={activeDragId}
            overDragId={overDragId}
            allItems={allItems}
            onToggleExpand={toggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeDragNode && sortableEnabled
            ? (
                <CategoryRowPreview
                  node={activeDragNode}
                  depth={activeDragDepth}
                />
              )
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
