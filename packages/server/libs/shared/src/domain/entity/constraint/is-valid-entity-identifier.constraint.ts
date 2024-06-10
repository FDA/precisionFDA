import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { UidUtils } from '@shared/utils/uid.utils'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DXEnityType, DXEntities } from '../domain/dxid'

@ValidatorConstraint({ async: true })
class IsValidEntittyIdentifierConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    let entityType: EntityType = args.constraints[0]
    if (!entityType) {
      entityType = value.split('-')[0] as EntityType
    }

    return (DXEntities as ReadonlyArray<string>).includes(entityType)
      ? UidUtils.isValidUId(value, entityType as DXEnityType)
      : new RegExp(`^${entityType}-\\d+$`).test(value)
  }

  defaultMessage(args: ValidationArguments) {
    const [entityType] = args.constraints as [EntityType]
    const message = 'Provided value is not a valid entity identifier'

    if (!entityType) {
      return message
    }

    return `${message} for entity type "${entityType}"`
  }
}

export function IsValidEntityIdentifier(
  options?: EntityType,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEntityIdentifier',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsValidEntittyIdentifierConstraint,
    })
  }
}
