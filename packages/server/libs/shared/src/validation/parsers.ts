import * as errors from '../errors'
import { aggregateSchemaErrors, formatAggregatedError } from '../utils/aggregate-error'
import { validateDefined } from './validators'

export const parseNonEmptyString = (value: string | undefined) => {
  if (!value) {
    const errorMsg = `Value expected to be non-empty, got ${value}`
    throw new errors.ValidationError(errorMsg)
  }
  return value
}

export const parseEnumValueFromString = <T extends Exclude<string, ''>>(
  allowedValues: T[],
  defaultErrorFormatter?: (value: string | undefined) => string
) => (
  value: string | undefined,
  errorFormatter?: (value: string) => string
): T => {
  const nonEmptyValue = parseNonEmptyString(value)
  if (!allowedValues.includes(nonEmptyValue as T)) {
    const errorMsg = errorFormatter?.(nonEmptyValue)
      ?? defaultErrorFormatter?.(nonEmptyValue)
      ?? `Enum value "${nonEmptyValue}" expected to be one of ${JSON.stringify(allowedValues)}`
    throw new errors.ValidationError(errorMsg)
  }
  return nonEmptyValue as T
}

export const parseNumberFromString = (value: string | undefined, errorFormatter?: (value: string) => string) => {
  const nonEmptyValue = parseNonEmptyString(value)
  const numericValue = parseInt(nonEmptyValue, 10)
  if (Number.isNaN(numericValue)) {
    const errorMsg = errorFormatter?.(nonEmptyValue) ?? `Value expected to be number, got ${nonEmptyValue}`
    throw new errors.ValidationError(errorMsg)
  }
  return numericValue
}

export const parseBoundedNumberFromString = (
  lowerBound: number,
  upperBound: number,
) => (
  value: string | undefined,
  errorFormatter?: (value: string) => string
) => {
  const numericValue = parseNumberFromString(value, errorFormatter)
  if (numericValue < lowerBound) {
    throw new errors.ValidationError(`Expected value greater than ${lowerBound}, got ${value}`)
  }
  if (numericValue > upperBound) {
    throw new errors.ValidationError(`Expected value lesser than ${upperBound}, got ${value}`)
  }
  return numericValue
}

export const wrapMaybeUndefined = <T>(wrappedParser: (value: string | undefined) => T) => (value: string | undefined) =>
  value !== undefined ? wrappedParser(value) : null

export const wrapMaybeEmpty = <T>(wrappedParser: (value: string | undefined) => T) => (value: string | undefined) =>
  value ? wrappedParser(value) : null

export const wrapTuple = <
  T,
  TupleT extends T[],
  Size extends number = TupleT['length']
>(
  size: Size,
  wrappedParser: (value: string | undefined) => T,
  tupleDelimiter?: string,
  errorFormatter?: (value: string) => string
) => (value: string | undefined) => {
  const nonEmptyString = parseNonEmptyString(value);
  const arrayValues = nonEmptyString.split(tupleDelimiter ?? ',').map((v) => v.trim())
  if (arrayValues.length !== size) {
    const errorMsg = errorFormatter?.(nonEmptyString) ?? `Value expected to be tuple of length ${
      size
    }, got ${value}`
    throw new errors.ValidationError(errorMsg)
  }
  const parsers = Array<ReturnType<typeof wrapMaybeUndefined>>(size).fill(wrappedParser)
  const {
    result,
    errors: caughtErrors
  } = aggregateSchemaErrors(
    arrayValues.map((v, i) => () => {
      return parsers[i](v)
    }),
  )
  if (caughtErrors.length > 0) {

    throw formatAggregatedError(
      'Encountered multiple errors in array',
      caughtErrors,
      {
        clientResponse: 'Aggregate Error',
        clientStatusCode: 400,
        code: errors.ErrorCodes.VALIDATION,
      },
    )
  }
  return result as TupleT
}

export const parseNumericRange = (value: string | undefined) => {
  const [ $gte, $lte ] = wrapTuple(2, wrapMaybeEmpty(parseNumberFromString))(value)
  const gtePresent = validateDefined($gte)
  const ltePresent = validateDefined($lte)
  // TODO(samuel) commented out, because website is stuck on infinite load when server respons with 400
  // TODO(samuel) happens on /admin/users endpoint
  // This case can happen when just delimiter "," was parsed
  // if ($gte && $lte && $gte > $lte) {
  //   throw new errors.ValidationError(`Invalid range, ${$gte} > ${$lte}`)
  // }
  if (!gtePresent && !ltePresent) {
    return null
  }
  return {
    ...gtePresent ? {$gte} : {},
    ...ltePresent ? {$lte} : {},
  }
}

export const parseIpv4Address = wrapTuple(4, parseBoundedNumberFromString(0, 255), '.')

export const parseIpv4Cidr = (value: string | undefined) => {
  const [ipv4String, maskString] = wrapTuple(2, parseNonEmptyString, '/')(value)
  const ipv4Quadruple = parseIpv4Address(ipv4String)
  const maskSize = parseBoundedNumberFromString(0, 32)(maskString)
  return {
    ipv4Quadruple,
    maskSize,
  }
}

