import { Transform } from 'class-transformer'

export function TransformEnumKey<T extends object>(enumObj: T): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return undefined

    const upper = value.toUpperCase()
    return Object.prototype.hasOwnProperty.call(enumObj, upper)
      ? enumObj[upper as keyof T]
      : undefined
  })
}
