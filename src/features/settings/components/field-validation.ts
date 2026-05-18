import type { AnyFieldApi } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-form'

export function useShowFieldError(field: AnyFieldApi) {
  const errors = useStore(field.store, state => state.meta.errors)
  const isTouched = useStore(field.store, state => state.meta.isTouched)
  const isBlurred = useStore(field.store, state => state.meta.isBlurred)
  const submissionAttempts = useStore(
    field.form.store,
    state => state.submissionAttempts,
  )

  return (
    errors.length > 0
    && (isTouched || isBlurred || submissionAttempts > 0)
  )
}
