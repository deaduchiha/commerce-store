interface FormStatusProps {
  successMessage?: string | null
  errorMessage?: string | null
}

export function FormStatus({ successMessage, errorMessage }: FormStatusProps) {
  if (!successMessage && !errorMessage) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {successMessage && (
        <p className="text-sm text-primary">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
