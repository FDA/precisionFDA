import { UidUtils } from '@shared/utils/uid.utils'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DXEnityType } from '../domain/dxid'

type ConstraintOptions = {
  entityType: DXEnityType
  each?: boolean
}

@ValidatorConstraint({ async: true })
class IsUidValidConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const [options] = args.constraints as [ConstraintOptions]

    if (options.each) {
      return value.every((v: any) => UidUtils.isValidUId(v, options.entityType))
    }
    return UidUtils.isValidUId(value, options.entityType)
  }

  defaultMessage(args: ValidationArguments) {
    const [options] = args.constraints as [ConstraintOptions]
    const entityType = options?.entityType
    const message = 'Provided value is not a valid uid'

    if (entityType == null) {
      return message
    }

    return `${message} for entity type "${entityType}"`
  }
}

export function IsValidUid(options?: ConstraintOptions, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidUid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsUidValidConstraint,
    })
  }
}
