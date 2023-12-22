import { PipeTransform } from '@nestjs/common'
import { errors } from '@shared'
import * as z from 'zod'

export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: z.Schema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      throw new errors.ValidationError('', {
        code: errors.ErrorCodes.VALIDATION,
        statusCode: 400,
        validationErrors: error,
      })
    }
  }
}
