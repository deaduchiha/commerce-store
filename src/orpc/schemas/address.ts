import { z } from 'zod'

export const addressLabelSchema = z.enum(['home', 'work', 'other'])

export const addressSchema = z.object({
  id: z.string(),
  label: addressLabelSchema,
  recipientName: z.string(),
  recipientPhone: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string().nullable(),
  streetAddress: z.string(),
  plateNumber: z.string().nullable(),
  unit: z.string().nullable(),
  postalCode: z.string(),
  nationalCode: z.string().nullable(),
  isDefault: z.boolean(),
})

export const addressInputSchema = z.object({
  label: addressLabelSchema,
  recipientName: z
    .string()
    .trim()
    .min(2, 'نام گیرنده باید حداقل ۲ کاراکتر باشد'),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
  province: z.string().trim().min(2, 'استان را وارد کنید'),
  city: z.string().trim().min(2, 'شهر را وارد کنید'),
  district: z.string().trim().optional(),
  streetAddress: z
    .string()
    .trim()
    .min(5, 'آدرس کامل را وارد کنید'),
  plateNumber: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
  nationalCode: z
    .string()
    .trim()
    .refine(
      value => value === '' || /^\d{10}$/.test(value),
      'کد ملی باید ۱۰ رقم باشد',
    )
    .optional(),
  isDefault: z.boolean().optional(),
})

/** TanStack Form schema — matches `AddressFormValues` (all fields present). */
export const addressFormSchema = z.object({
  label: addressLabelSchema,
  recipientName: z
    .string()
    .trim()
    .min(2, 'نام گیرنده باید حداقل ۲ کاراکتر باشد'),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
  province: z.string().trim().min(2, 'استان را وارد کنید'),
  city: z.string().trim().min(2, 'شهر را وارد کنید'),
  district: z.string().trim(),
  streetAddress: z
    .string()
    .trim()
    .min(5, 'آدرس کامل را وارد کنید'),
  plateNumber: z.string().trim(),
  unit: z.string().trim(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
  nationalCode: z
    .string()
    .trim()
    .refine(
      value => value === '' || /^\d{10}$/.test(value),
      'کد ملی باید ۱۰ رقم باشد',
    ),
  isDefault: z.boolean(),
})

export type AddressLabel = z.infer<typeof addressLabelSchema>
export type Address = z.infer<typeof addressSchema>
export type AddressInput = z.infer<typeof addressInputSchema>
export type AddressFormValues = z.infer<typeof addressFormSchema>
