import type { OrpcContext } from '#/orpc/context'
import { os } from '@orpc/server'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { orders, user } from '#/db/schema'
import { requireAdmin } from '#/orpc/lib/require-admin'
import { adminPaymentSchema } from '#/orpc/schemas/admin/payments'

export const list = os.handler(async ({ context }) => {
  const { headers } = context as OrpcContext
  await requireAdmin(headers)

  const rows = await db
    .select({
      order: orders,
      userName: user.name,
      userPhone: user.phoneNumber,
    })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))

  return rows.map(({ order, userName, userPhone }) =>
    adminPaymentSchema.parse({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userName,
      userPhone: userPhone ?? null,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalInRials: order.totalInRials,
      createdAt: order.createdAt.toISOString(),
    }),
  )
})
