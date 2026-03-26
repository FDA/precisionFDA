import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { isString } from '@nestjs/common/utils/shared.utils'
import { UidUtils } from '@shared/utils/uid.utils'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DXEntityType, DXEntities } from '../domain/dxid'

@ValidatorConstraint({ async: true })
class IsValidEntityIdentifierConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown, args: ValidationArguments) {
    if (!isString(value)) {
      return false
    }

    let entityType: EntityType = args.constraints[0]
    if (!entityType) {
      entityType = value.split('-')[0] as EntityType
    }

    return this.isDxEntityType(entityType)
      ? UidUtils.isValidUId(value, entityType)
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

  private isDxEntityType(value: string): value is DXEntityType {
    return DXEntities.includes(value as DXEntityType)
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
      validator: IsValidEntityIdentifierConstraint,
    })
  }
}
