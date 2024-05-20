import { isString } from '@nestjs/common/utils/shared.utils'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

type ConstraintOptions = { allowPrivate: boolean; allowPublic: boolean; allowSpace: boolean }

@ValidatorConstraint({ name: 'isValidScope', async: false })
class IsValidScopeConstraint implements ValidatorConstraintInterface {
  validate(scope: unknown, args: ValidationArguments) {
    const [options] = args.constraints as [ConstraintOptions]

    if (!isString(scope)) {
      return false
    }

    if (options.allowPrivate && scope === 'private') {
      return true
    }

    if (options.allowPublic && scope === 'public') {
      return true
    }

    return options.allowSpace && EntityScopeUtils.isSpaceScope(scope)
  }

  defaultMessage(args: ValidationArguments) {
    const [options] = args.constraints as [ConstraintOptions]
    const allowedValues = []

    if (options.allowPrivate) {
      allowedValues.push('"private"')
    }
    if (options.allowPublic) {
      allowedValues.push('"public"')
    }

    if (options.allowSpace) {
      allowedValues.push('"space-{number}" (where {number} is an integer)')
    }

    return `Scope must be one of: ${allowedValues.join(', ')}.`
  }
}

export function IsValidScope(
  options?: Partial<ConstraintOptions>,
  validationOptions?: ValidationOptions,
) {
  const defaultOptions: ConstraintOptions = {
    allowPrivate: true,
    allowPublic: true,
    allowSpace: true,
  }
  const effectiveOptions = { ...defaultOptions, ...options }

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidScope',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [effectiveOptions],
      options: validationOptions,
      validator: IsValidScopeConstraint,
    })
  }
}
