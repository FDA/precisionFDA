import { PipeTransform } from '@nestjs/common'
import { ErrorCodes, ValidationError } from '@shared/errors'
import * as z from 'zod'

/**
 * @Deprecated - use class-validator and class-transformer in combination with DTOs instead.
 * Visit https://confluence.internal.dnanexus.com/display/XVGEN/Backend+development+guide to learn more.
 */
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: z.Schema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      throw new ValidationError('', {
        code: ErrorCodes.VALIDATION,
        statusCode: 400,
        validationErrors: error,
      })
    }
  }
}
