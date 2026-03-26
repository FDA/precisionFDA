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
import { ValidationError } from '@shared/errors'

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
      throw new ValidationError('Input must be a plain object')
    }

    const instance = plainToClass(expectedType, nnOptions)
    object.input = instance

    const errors = await validate(instance)

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('; ')
      throw new ValidationError(errorMessages)
    }

    return true
  }

  // biome-ignore-start lint/complexity/useLiteralKeys: Should be fixed
  defaultMessage(args: ValidationArguments) {
    const object = args.object as TypedEmailBodyDto
    const type = object.type
    const additionalErrors = object['validationErrors']
      ? `: ${object['validationErrors'].join('; ')}`
      : ''
    return `Email Input does not satisfy constraints for the provided type "${type}"${additionalErrors}`
  }
  // biome-ignore-end lint/complexity/useLiteralKeys: Should be fixed
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
