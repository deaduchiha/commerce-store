import { z } from 'zod'

export const adminPaymentSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhone: z.string().nullable(),
  status: z.string(),
  paymentMethod: z.enum(['online', 'cod']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  totalInRials: z.number().int(),
  createdAt: z.string(),
})

export type AdminPayment = z.infer<typeof adminPaymentSchema>
