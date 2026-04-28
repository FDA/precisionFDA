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
