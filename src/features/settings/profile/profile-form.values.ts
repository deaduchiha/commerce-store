import type {
  Profile,
  ProfileFormValues,
  UpdateProfileInput,
} from '#/orpc/schemas/profile'
import { toFormBirthday } from '#/lib/date'

export type { ProfileFormValues }

export function toProfileFormValues(profile: Profile): ProfileFormValues {
  return {
    name: profile.name,
    gender: profile.gender ?? '',
    birthday: toFormBirthday(profile.birthday),
  }
}

export function toProfileUpdatePayload(
  values: ProfileFormValues,
): UpdateProfileInput {
  return {
    name: values.name,
    gender: values.gender || null,
    birthday: values.birthday || null,
  }
}
