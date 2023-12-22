import { ArgumentMetadata, PipeTransform } from '@nestjs/common'
import { ajv, errors } from '@shared'
import type { JSONSchema7 } from 'json-schema'
import { isEmpty } from 'ramda'

export class JsonSchemaPipe implements PipeTransform {
  constructor(private readonly schema: JSONSchema7) {
    if (isEmpty(schema)) {
      throw new errors.InternalError('Empty schema spec passed to json schema pipe.')
    }
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    const validateFunction = ajv.compile(this.schema)

    if (validateFunction(value)) {
      return value
    }

    throw new errors.ValidationError(`Request ${metadata.type} invalid`, {
      code: errors.ErrorCodes.VALIDATION,
      statusCode: 400,
      validationErrors: validateFunction.errors,
    })
  }
}
