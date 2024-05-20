import { ValidationError } from '@shared/errors'

// TODO(samuel) possibly reuse these utils
export const numericBodyValidator = (value: number, fieldPath: string) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new ValidationError(`Invalid "${fieldPath}": ${
      value
    }, expected non-negative number`)
  }
}

export const enumValidator = <T extends string>(allowedValues: T[]) => (value: string, fieldPath: string) => {
  if (!allowedValues.includes(value as T)) {
    throw new Error(`Invalid "${fieldPath}" expected to be one of ${JSON.stringify(allowedValues)}`)
  }
}
