import type { ReactNode } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export function CatalogSectionActions({
  createLabel,
  onCreate,
}: {
  createLabel: string
  onCreate: () => void
}) {
  return (
    <div className="flex justify-end">
      <Button type="button" onClick={onCreate}>
        <Plus />
        {createLabel}
      </Button>
    </div>
  )
}

export function CatalogTable({
  columns,
  isEmpty,
  isLoading,
  emptyMessage = 'موردی ثبت نشده است.',
  children,
}: {
  columns: string[]
  isEmpty: boolean
  isLoading: boolean
  emptyMessage?: string
  children: ReactNode
}) {
  if (isLoading) {
    return <Skeleton className="h-56 w-full" />
  }

  return (
    <div className="overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map(column => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty
            ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-24 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )
            : children}
        </TableBody>
      </Table>
    </div>
  )
}

export function RowActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: {
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <TableCell>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="icon-sm" onClick={onEdit}>
          <Pencil />
          <span className="sr-only">{editLabel}</span>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          onClick={onDelete}
        >
          <Trash2 />
          <span className="sr-only">{deleteLabel}</span>
        </Button>
      </div>
    </TableCell>
  )
}

export function DeleteCatalogDialog({
  open,
  title,
  description,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function StatusCell({ active }: { active: boolean }) {
  return (
    <TableCell>
      <Badge variant={active ? 'default' : 'secondary'}>
        {active ? 'فعال' : 'غیرفعال'}
      </Badge>
    </TableCell>
  )
}
