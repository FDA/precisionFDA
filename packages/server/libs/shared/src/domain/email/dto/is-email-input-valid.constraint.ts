import { isPlainObject } from '@nestjs/common/utils/shared.utils'
import { plainToClass } from 'class-transformer'
import {
  registerDecorator,
  validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { EmailInputFormat, TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { emailTypeToInputDtoMap } from '@shared/domain/email/dto/email-type-to-input.map'

@ValidatorConstraint({ async: true })
export class IsEmailInputValidConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown, args: ValidationArguments) {
    const object = args.object as TypedEmailBodyDto
    const input: EmailInputFormat = object.type
    const expectedType = emailTypeToInputDtoMap[input]

    if (expectedType == null) {
      return value == null
    }

    const nnOptions = value ?? {}

    if (!isPlainObject(nnOptions)) {
      return false
    }

    const instance = plainToClass(expectedType, nnOptions)
    object.input = instance

    const errors = await validate(instance)

    return errors.length === 0
  }

  defaultMessage(args: ValidationArguments) {
    const type = (args.object as TypedEmailBodyDto)?.type
    return `Email Input does not satisfy constraints for the provided type "${type}"`
  }
}

export function IsEmailInputValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailInputValid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsEmailInputValidConstraint,
    })
  }
}
