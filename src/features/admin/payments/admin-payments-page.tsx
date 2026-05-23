import { useQuery } from '@tanstack/react-query'

import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from '#/components/admin/data-table'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import { formatRials } from '#/lib/format'
import { orpc } from '#/orpc/client'

const paymentStatusLabels = {
  pending: 'در انتظار',
  paid: 'پرداخت‌شده',
  failed: 'ناموفق',
  refunded: 'استرداد',
} as const

const paymentMethodLabels = {
  online: 'آنلاین',
  cod: 'پرداخت در محل',
} as const

export function AdminPaymentsPage() {
  const paymentsQuery = useQuery(orpc.admin.payments.list.queryOptions())

  if (paymentsQuery.isPending) {
    return <Skeleton className="h-64 w-full" />
  }

  if (paymentsQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        بارگذاری پرداخت‌ها با خطا مواجه شد.
      </p>
    )
  }

  const payments = paymentsQuery.data

  return (
    <DataTable
      columns={[
        'شماره سفارش',
        'مشتری',
        'موبایل',
        'روش پرداخت',
        'وضعیت پرداخت',
        'مبلغ',
        'تاریخ',
      ]}
      isEmpty={payments.length === 0}
      emptyMessage="هنوز سفارشی ثبت نشده است."
    >
      {payments.map(payment => (
        <DataTableRow key={payment.id}>
          <DataTableCell className="font-mono text-xs">
            {payment.orderNumber}
          </DataTableCell>
          <DataTableCell>{payment.userName}</DataTableCell>
          <DataTableCell>{payment.userPhone ?? '—'}</DataTableCell>
          <DataTableCell>
            {paymentMethodLabels[payment.paymentMethod]}
          </DataTableCell>
          <DataTableCell>
            <Badge variant="outline">
              {paymentStatusLabels[payment.paymentStatus]}
            </Badge>
          </DataTableCell>
          <DataTableCell>{formatRials(payment.totalInRials)}</DataTableCell>
          <DataTableCell>
            {new Date(payment.createdAt).toLocaleDateString('fa-IR')}
          </DataTableCell>
        </DataTableRow>
      ))}
    </DataTable>
  )
}
