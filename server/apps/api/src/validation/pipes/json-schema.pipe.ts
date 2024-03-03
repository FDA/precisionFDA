import { ArgumentMetadata, PipeTransform } from '@nestjs/common'
import { ErrorCodes, InternalError, ValidationError } from '@shared/errors'
import { ajv } from '@shared/utils/validator'
import type { JSONSchema7 } from 'json-schema'
import { isEmpty } from 'ramda'

/**
 * @Deprecated - use class-validator and class-transformer in combination with DTOs instead.
 * Visit https://confluence.internal.dnanexus.com/display/XVGEN/Backend+development+guide to learn more.
 */
export class JsonSchemaPipe implements PipeTransform {
  constructor(private readonly schema: JSONSchema7) {
    if (isEmpty(schema)) {
      throw new InternalError('Empty schema spec passed to json schema pipe.')
    }
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    const validateFunction = ajv.compile(this.schema)

    if (validateFunction(value)) {
      return value
    }

    throw new ValidationError(`Request ${metadata.type} invalid`, {
      code: ErrorCodes.VALIDATION,
      statusCode: 400,
      validationErrors: validateFunction.errors,
    })
  }
}
