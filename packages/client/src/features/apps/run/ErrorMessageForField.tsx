import type { FieldErrors, FieldPath, FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { FieldError } from '@/components/ui/field'

export const ErrorMessageForField = ({ errors: _errors, fieldName }: { errors: FieldErrors; fieldName: string }) => {
  const { formState, getFieldState } = useFormContext<FieldValues>()
  const { error, isTouched } = getFieldState(fieldName as FieldPath<FieldValues>, formState)

  if (!error?.message || (!isTouched && !formState.isSubmitted)) {
    return null
  }

  return <FieldError>{error.message}</FieldError>
}
