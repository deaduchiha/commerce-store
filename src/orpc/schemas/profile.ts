import { parseISO } from 'date-fns'
import { z } from 'zod'

export const profileGenderSchema = z.enum(['male', 'female', 'other'])

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  phoneNumberVerified: z.boolean(),
  role: z.string(),
  image: z.string().nullable(),
  gender: profileGenderSchema.nullable(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
})

const birthdayFieldSchema = z
  .string()
  .refine(
    value => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
    'تاریخ تولد نامعتبر است',
  )
  .refine((value) => {
    if (!value) {
      return true
    }

    const date = parseISO(value)
    const min = new Date('1900-01-01')
    const max = new Date()

    return date >= min && date <= max
  }, 'تاریخ تولد نامعتبر است')

/** Form state — empty strings for unset optional fields. */
export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
    .max(80, 'نام نباید بیشتر از ۸۰ کاراکتر باشد'),
  gender: z.union([z.literal(''), profileGenderSchema]),
  birthday: birthdayFieldSchema,
})

const birthdayApiSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ تولد نامعتبر است')
  .refine((value) => {
    const date = parseISO(value)
    const min = new Date('1900-01-01')
    const max = new Date()

    return date >= min && date <= max
  }, 'تاریخ تولد نامعتبر است')

export const updateProfileInputSchema = z.object({
  name: profileFormSchema.shape.name,
  gender: profileGenderSchema.nullable(),
  birthday: birthdayApiSchema.nullable(),
})

export type ProfileGender = z.infer<typeof profileGenderSchema>
export type Profile = z.infer<typeof profileSchema>
export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
