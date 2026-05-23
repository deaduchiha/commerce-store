import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

interface DataTableProps {
  columns: string[]
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
  className?: string
}

export function DataTable({
  columns,
  children,
  emptyMessage = 'موردی یافت نشد.',
  isEmpty = false,
  className,
}: DataTableProps) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border', className)}>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map(column => (
              <th
                key={column}
                className="px-4 py-3 text-start font-medium"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty
            ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-muted-foreground px-4 py-8 text-center"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
            : (
                children
              )}
        </tbody>
      </table>
    </div>
  )
}

export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <tr className={cn('border-b last:border-0 hover:bg-muted/30', className)}>
      {children}
    </tr>
  )
}

export function DataTableCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>
}
