import { useEffect } from 'react'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { MutationErrors } from '../types/utils'

export function formatMutationErrors(
  obj?: Record<string, string[]>,
): MutationErrors | undefined {
  const nObj = obj
  if (nObj) {
    return {
      errors: [],
      fieldErrors: Object.keys(nObj).length > 0 ? ({ ...nObj }) : {},
    }
  }
  return undefined
}

export const useMutationErrorEffect = <T extends FieldValues>(setError: UseFormSetError<T>, mutationErrors?: MutationErrors) => useEffect(() => {
    if (mutationErrors) {
      Object.keys(mutationErrors.fieldErrors).forEach((e: string) => {
        setError(e as Path<T>, { message: mutationErrors.fieldErrors[e].join('; '), type: 'onChange' })
      })
    }
  }, [mutationErrors])
