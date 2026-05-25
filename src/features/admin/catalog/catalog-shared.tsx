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
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { Switch } from '#/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Textarea } from '#/components/ui/textarea'

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

export function TextInput({
  label,
  value,
  onChange,
  dir,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  dir?: React.HTMLAttributes<HTMLInputElement>['dir']
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
      />
    </Field>
  )
}

export function TextAreaInput({
  label,
  description,
  value,
  onChange,
  dir,
}: {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  dir?: React.HTMLAttributes<HTMLTextAreaElement>['dir']
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Textarea
        dir={dir}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </Field>
  )
}

export function SelectInput<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: TValue
  options: Array<[TValue, string]>
  onChange: (value: TValue) => void
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, label]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function ActiveSwitch({
  checked,
  onChange,
  label = 'فعال',
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}) {
  return (
    <Field
      orientation="horizontal"
      className="items-center justify-between border p-3"
    >
      <FieldLabel>{label}</FieldLabel>
      <Switch checked={checked} onCheckedChange={onChange} />
    </Field>
  )
}
