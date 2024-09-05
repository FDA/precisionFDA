import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe } from '@nestjs/common'
import { ValidationError } from '@shared/errors'

/**
 * Custom pipe designed for use within NestJS backend.
 * It acts as a wrapper around the built-in `ValidationPipe`, providing an additional
 * layer of error handling specifically for validation exceptions.
 *
 * This pipe intercepts the validation process, allowing validation errors to be caught
 * and rethrown as custom validation exceptions. The primary goal of this custom pipe
 * is to ensure a unified error response pattern across the application.
 *
 * It automatically applies the transformation logic defined in the NestJS `ValidationPipe`, ensuring that input
 * data is validated and transformed according to the specified DTOs.
 *
 **/
@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata)
    } catch (error) {
      // Check if it's a validation error
      if (error instanceof BadRequestException) {
        const response = error.getResponse()
        let message = 'Validation failed'
        if (typeof response === 'object' && 'message' in response) {
          message = Array.isArray(response['message'])
            ? response['message'].join(', ')
            : response['message'].toString()
        }
        throw new ValidationError(message)
      }
      // If it's not a validation error, rethrow the original error
      throw error
    }
  }
}
