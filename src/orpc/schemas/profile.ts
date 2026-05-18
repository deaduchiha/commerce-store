import { z } from 'zod'

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  phoneNumberVerified: z.boolean(),
  role: z.string(),
  image: z.string().nullable(),
})

export const updateProfileInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
    .max(80, 'نام نباید بیشتر از ۸۰ کاراکتر باشد'),
})

export type Profile = z.infer<typeof profileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
