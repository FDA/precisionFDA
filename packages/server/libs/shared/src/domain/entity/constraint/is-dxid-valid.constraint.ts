import { isString } from '@nestjs/common/utils/shared.utils'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DxIdUtils } from '@shared/utils/dxid.utils'
import { DXEntityType } from '../domain/dxid'

type ConstraintOptions = {
  entityType: DXEntityType
  each?: boolean
}

@ValidatorConstraint({ async: true })
class IsDxidValidConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    const [options] = args.constraints as [ConstraintOptions]

    if (!options.each && isString(value)) {
      return DxIdUtils.isDxIdValid(value, options.entityType)
    }

    if (!Array.isArray(value)) {
      return false
    }

    return value.every((v: string) => DxIdUtils.isDxIdValid(v, options.entityType))
  }

  defaultMessage(args: ValidationArguments): string {
    const [options] = args.constraints as [ConstraintOptions]
    const entityType = options?.entityType
    const message = 'Provided value is not a valid dxid'

    if (entityType == null) {
      return message
    }

    return `${message} for entity type "${entityType}"`
  }
}

export function IsValidDxid(options?: ConstraintOptions, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidDxid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsDxidValidConstraint,
    })
  }
}
