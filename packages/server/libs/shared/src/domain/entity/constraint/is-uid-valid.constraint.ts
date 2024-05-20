import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { UidUtils } from '@shared/utils/uid.utils'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
class IsUidValidConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const [entityType] = args.constraints as [EntityType]

    return UidUtils.isValidUId(value, entityType)
  }

  defaultMessage(args: ValidationArguments) {
    const [entityType] = args.constraints as [EntityType]
    const message = 'Provided value is not a valid uid'

    if (entityType == null) {
      return message
    }

    return `${message} for entity type "${entityType}"`
  }
}

export function IsValidUid(options?: EntityType, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidScope',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsUidValidConstraint,
    })
  }
}
