import { useEffect } from 'react'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { MutationErrors } from '@/types/utils'

const RESERVED_ERROR_KEYS = new Set(['error', 'errors', 'fieldErrors', 'message', 'code', 'statusCode'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeMessages = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.filter((message): message is string => typeof message === 'string')
  }

  return []
}

const addFieldErrors = (fieldErrors: Record<string, string[]>, value: unknown) => {
  if (!isRecord(value)) {
    return
  }

  Object.entries(value).forEach(([field, fieldValue]) => {
    const messages = normalizeMessages(fieldValue)
    if (messages.length > 0) {
      fieldErrors[field] = messages
    }
  })
}

export function formatMutationErrors(obj?: unknown): MutationErrors | undefined {
  const errors: string[] = []
  const fieldErrors: Record<string, string[]> = {}

  if (typeof obj === 'string') {
    errors.push(obj)
  } else if (isRecord(obj)) {
    if (isRecord(obj.error)) {
      errors.push(...normalizeMessages(obj.error.message))
    }

    errors.push(...normalizeMessages(obj.message))

    if (isRecord(obj.errors)) {
      addFieldErrors(fieldErrors, obj.errors)
    } else {
      errors.push(...normalizeMessages(obj.errors))
    }

    addFieldErrors(fieldErrors, obj.fieldErrors)

    Object.entries(obj).forEach(([field, fieldValue]) => {
      if (!RESERVED_ERROR_KEYS.has(field)) {
        const messages = normalizeMessages(fieldValue)
        if (messages.length > 0) {
          fieldErrors[field] = messages
        }
      }
    })
  }

  if (errors.length === 0 && Object.keys(fieldErrors).length === 0) {
    return undefined
  }

  return {
    errors,
    fieldErrors,
  }
}

export const useMutationErrorEffect = <T extends FieldValues>(
  setError: UseFormSetError<T>,
  mutationErrors?: MutationErrors,
) =>
  useEffect(() => {
    if (mutationErrors) {
      Object.keys(mutationErrors.fieldErrors).forEach((e: string) => {
        setError(e as Path<T>, {
          message: normalizeMessages(mutationErrors.fieldErrors[e]).join('; '),
          type: 'onChange',
        })
      })
    }
  }, [mutationErrors])
