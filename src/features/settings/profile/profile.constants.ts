import type { ProfileGender } from '#/orpc/schemas/profile'

export const PROFILE_GENDER_OPTIONS: {
  value: ProfileGender
  label: string
}[] = [
  { value: 'male', label: 'مرد' },
  { value: 'female', label: 'زن' },
  { value: 'other', label: 'سایر' },
]
