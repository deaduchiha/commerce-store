import { z } from 'zod'

import { userRoleSchema } from '#/lib/roles'

export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  role: userRoleSchema,
  createdAt: z.string(),
})

export const updateUserRoleInputSchema = z.object({
  userId: z.string().min(1),
  role: userRoleSchema,
})

export type AdminUser = z.infer<typeof adminUserSchema>
