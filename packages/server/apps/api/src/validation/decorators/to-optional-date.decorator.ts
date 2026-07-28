import { Transform } from 'class-transformer'

type OptionalDateTransform = (args: { value: unknown }) => Date | undefined

const transformToOptionalDate: OptionalDateTransform = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export const ToOptionalDate: () => PropertyDecorator = () => Transform(transformToOptionalDate)

const transformToOptionalEndOfDayDate: OptionalDateTransform = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999)
    : parsed
}

export const ToOptionalEndOfDayDate: () => PropertyDecorator = () => Transform(transformToOptionalEndOfDayDate)
