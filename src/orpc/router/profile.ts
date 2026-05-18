import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'

import { eq } from 'drizzle-orm'
import { db } from '#/db'
import { user } from '#/db/schema'
import { requireSession } from '#/orpc/lib/require-session'
import {
  profileSchema,
  updateProfileInputSchema,
} from '#/orpc/schemas/profile'

function toProfile(row: typeof user.$inferSelect) {
  return profileSchema.parse({
    id: row.id,
    name: row.name,
    email: row.email,
    phoneNumber: row.phoneNumber ?? null,
    phoneNumberVerified: row.phoneNumberVerified ?? false,
    role: row.role,
    image: row.image ?? null,
  })
}

export const get = os.handler(async ({ context }) => {
  const { headers } = context as OrpcContext
  const session = await requireSession(headers)

  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!row) {
    throw new ORPCError('NOT_FOUND', { message: 'User not found.' })
  }

  return toProfile(row)
})

export const update = os
  .input(updateProfileInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    const session = await requireSession(headers)

    const [row] = await db
      .update(user)
      .set({ name: input.name })
      .where(eq(user.id, session.user.id))
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found.' })
    }

    return toProfile(row)
  })
