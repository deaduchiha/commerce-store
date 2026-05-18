import type { AnyFieldApi } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-form'

export function useShowFieldError(field: AnyFieldApi) {
  const submissionAttempts = useStore(
    field.form.store,
    state => state.submissionAttempts,
  )

  const hasErrors = field.state.meta.errors.length > 0

  return (
    hasErrors
    && (field.state.meta.isTouched
      || field.state.meta.isBlurred
      || submissionAttempts > 0)
  )
}
