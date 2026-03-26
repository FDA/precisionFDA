import { Transform } from 'class-transformer'
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export function TransformAndValidateBoolean(validationOptions?: ValidationOptions) {
  return function (target: unknown, propertyKey: string) {
    Transform(
      ({ value }) => {
        if (typeof value === 'boolean') {
          return value
        }

        const stringValue = value?.toString().toLowerCase()

        if (['true', '1', 'yes', 'on'].includes(stringValue)) {
          return true
        }

        if (['false', '0', 'no', 'off'].includes(stringValue)) {
          return false
        }

        return value
      },
      { toClassOnly: true },
    )(target, propertyKey)

    registerDecorator({
      target: target.constructor,
      propertyName: propertyKey,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: unknown) {
          return value === true || value === false
        },
        defaultMessage(args: ValidationArguments) {
          return `Invalid boolean value: ${args.value}`
        },
      },
    })
  }
}
