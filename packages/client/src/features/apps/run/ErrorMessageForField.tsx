import { ErrorMessage } from '@hookform/error-message'
import type { FieldErrors } from 'react-hook-form'
import { FieldError } from '@/components/ui/field'

export const ErrorMessageForField = ({ errors, fieldName }: { errors: FieldErrors; fieldName: string }) => (
  <ErrorMessage
    errors={errors}
    name={fieldName}
    render={({ message }) => (message ? <FieldError>{message}</FieldError> : null)}
  />
)
