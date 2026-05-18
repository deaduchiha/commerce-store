import type { OrpcContext } from '#/orpc/context'
import { ORPCError, os } from '@orpc/server'
import { and, desc, eq, ne } from 'drizzle-orm'
import * as z from 'zod'

import { db } from '#/db'
import { addresses } from '#/db/schema'
import { requireSession } from '#/orpc/lib/require-session'
import {
  addressInputSchema,
  addressSchema,
  type AddressInput,
} from '#/orpc/schemas/address'

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toAddress(row: typeof addresses.$inferSelect) {
  return addressSchema.parse({
    id: row.id,
    label: row.label,
    recipientName: row.recipientName,
    recipientPhone: row.recipientPhone,
    province: row.province,
    city: row.city,
    district: row.district,
    streetAddress: row.streetAddress,
    plateNumber: row.plateNumber,
    unit: row.unit,
    postalCode: row.postalCode,
    nationalCode: row.nationalCode,
    isDefault: row.isDefault,
  })
}

function toInsertValues(userId: string, input: AddressInput) {
  return {
    userId,
    label: input.label,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    province: input.province,
    city: input.city,
    district: emptyToNull(input.district),
    streetAddress: input.streetAddress,
    plateNumber: emptyToNull(input.plateNumber),
    unit: emptyToNull(input.unit),
    postalCode: input.postalCode,
    nationalCode: emptyToNull(input.nationalCode),
    isDefault: input.isDefault ?? false,
  }
}

async function clearDefaultAddresses(userId: string, exceptId?: string) {
  await db
    .update(addresses)
    .set({ isDefault: false })
    .where(
      exceptId
        ? and(eq(addresses.userId, userId), ne(addresses.id, exceptId))
        : eq(addresses.userId, userId),
    )
}

async function getAddressForUser(addressId: string, userId: string) {
  const [row] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .limit(1)

  return row
}

export const list = os.handler(async ({ context }) => {
  const { headers } = context as OrpcContext
  const session = await requireSession(headers)

  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt))

  return rows.map(toAddress)
})

export const create = os
  .input(addressInputSchema)
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    const session = await requireSession(headers)

    const existing = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.userId, session.user.id))

    const shouldBeDefault = input.isDefault ?? existing.length === 0

    if (shouldBeDefault) {
      await clearDefaultAddresses(session.user.id)
    }

    const [row] = await db
      .insert(addresses)
      .values({
        ...toInsertValues(session.user.id, input),
        isDefault: shouldBeDefault,
      })
      .returning()

    return toAddress(row)
  })

export const update = os
  .input(
    z.object({
      id: z.string(),
      data: addressInputSchema,
    }),
  )
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    const session = await requireSession(headers)

    const existing = await getAddressForUser(input.id, session.user.id)

    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Address not found.' })
    }

    const shouldBeDefault = input.data.isDefault ?? existing.isDefault

    if (shouldBeDefault) {
      await clearDefaultAddresses(session.user.id, input.id)
    }

    const [row] = await db
      .update(addresses)
      .set({
        ...toInsertValues(session.user.id, input.data),
        isDefault: shouldBeDefault,
      })
      .where(
        and(eq(addresses.id, input.id), eq(addresses.userId, session.user.id)),
      )
      .returning()

    if (!row) {
      throw new ORPCError('NOT_FOUND', { message: 'Address not found.' })
    }

    if (!shouldBeDefault && existing.isDefault) {
      const [fallback] = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.userId, session.user.id),
            ne(addresses.id, input.id),
          ),
        )
        .orderBy(desc(addresses.createdAt))
        .limit(1)

      if (fallback) {
        await db
          .update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, fallback.id))
      }
    }

    return toAddress(row)
  })

export const remove = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    const session = await requireSession(headers)

    const existing = await getAddressForUser(input.id, session.user.id)

    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Address not found.' })
    }

    await db
      .delete(addresses)
      .where(
        and(eq(addresses.id, input.id), eq(addresses.userId, session.user.id)),
      )

    if (existing.isDefault) {
      const [fallback] = await db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, session.user.id))
        .orderBy(desc(addresses.createdAt))
        .limit(1)

      if (fallback) {
        await db
          .update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, fallback.id))
      }
    }

    return { success: true as const }
  })

export const setDefault = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const { headers } = context as OrpcContext
    const session = await requireSession(headers)

    const existing = await getAddressForUser(input.id, session.user.id)

    if (!existing) {
      throw new ORPCError('NOT_FOUND', { message: 'Address not found.' })
    }

    await clearDefaultAddresses(session.user.id, input.id)

    const [row] = await db
      .update(addresses)
      .set({ isDefault: true })
      .where(
        and(eq(addresses.id, input.id), eq(addresses.userId, session.user.id)),
      )
      .returning()

    return toAddress(row!)
  })
