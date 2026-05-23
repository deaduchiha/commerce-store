import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'
import { desc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { user } from '#/db/schema'
import { requireAdmin } from '#/orpc/lib/require-admin'
import {
  adminUserSchema,
  updateUserRoleInputSchema,
} from '#/orpc/schemas/admin/users'

function toAdminUser(row: typeof user.$inferSelect) {
  return adminUserSchema.parse({
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phoneNumber ?? null,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  })
}

export const list = os.handler(async ({ context }) => {
  const { headers } = context as OrpcContext
  await requireAdmin(headers)

  const rows = await db.select().from(user).orderBy(desc(user.createdAt))

  return rows.map(toAdminUser)
})

export const updateRole = os
  .input(updateUserRoleInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    const session = await requireAdmin(headers)

    if (input.userId === session.user.id && input.role !== 'admin') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'You cannot remove your own admin access.',
      })
    }

    const [row] = await db
      .update(user)
      .set({ role: input.role })
      .where(eq(user.id, input.userId))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found.' })
    }

    return toAdminUser(row)
  })
