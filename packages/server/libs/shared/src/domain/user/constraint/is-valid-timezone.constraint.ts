import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'isValidTimezone', async: false })
class IsValidTimezoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return false
    }

    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value })
      return true
    } catch {
      return false
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid IANA timezone`
  }
}

export function IsValidTimezone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidTimezone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidTimezoneConstraint,
    })
  }
}
