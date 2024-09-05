import { isPlainObject } from '@nestjs/common/utils/shared.utils'
import { SpaceReportCreateDto } from '@shared/domain/space-report/model/space-report-create.dto'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { spaceReportFormatToOptionsDtoMap } from '@shared/domain/space-report/model/space-report-format-to-options.map'
import { plainToClass } from 'class-transformer'
import {
  registerDecorator,
  validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
export class IsSpaceReportOptionsValidConstraint implements ValidatorConstraintInterface {
  async validate(options: unknown, args: ValidationArguments) {
    const object = args.object as SpaceReportCreateDto
    const format: SpaceReportFormat = object.format
    const expectedType = spaceReportFormatToOptionsDtoMap[format]

    if (expectedType == null) {
      return options == null
    }

    const nnOptions = options ?? {}

    if (!isPlainObject(nnOptions)) {
      return false
    }

    const instance = plainToClass(expectedType, nnOptions)
    object.options = instance

    const errors = await validate(instance)

    return errors.length === 0
  }

  defaultMessage(args: ValidationArguments) {
    const format = (args.object as SpaceReportCreateDto)?.format
    return `Options do not satisfy constraints for the provided format "${format}"`
  }
}

export function IsSpaceReportOptionsValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isOptionsValid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsSpaceReportOptionsValidConstraint,
    })
  }
}
