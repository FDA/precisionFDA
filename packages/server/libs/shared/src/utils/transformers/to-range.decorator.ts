import { Transform } from 'class-transformer'

const splitRange = (value: string): { lower?: string; upper?: string } | undefined => {
  try {
    const [lower, upper] = value.split(',')

    if (value === ',' || (!lower && !upper)) {
      return { lower: undefined, upper: undefined }
    }

    return { lower, upper }
  } catch {
    throw new Error(`Invalid range format: ${value}.`)
  }
}

export function ToNumberRange(): PropertyDecorator {
  return Transform(({ value }) => {
    const range = splitRange(value)
    if (typeof range !== 'object') return value

    return {
      lower: range.lower !== undefined && !Number.isNaN(Number(range.lower)) ? Number(range.lower) : undefined,
      upper: range.upper !== undefined && !Number.isNaN(Number(range.upper)) ? Number(range.upper) : undefined,
    }
  })
}

export function ToDateRange(): PropertyDecorator {
  return Transform(({ value }) => {
    const range = splitRange(value)
    if (typeof range !== 'object') return value

    const lower = new Date(range.lower)
    const upper = new Date(range.upper)

    return {
      lower: Number.isNaN(lower.getTime()) ? undefined : lower,
      upper: Number.isNaN(upper.getTime()) ? undefined : upper,
    }
  })
}
