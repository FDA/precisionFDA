import { Catch, HttpStatus } from '@nestjs/common'
import { config } from '@shared/config'
import { ErrorCodes } from '@shared/errors'
import { AbstractExceptionFilter, ErrorPayload } from './abstract-exception.filter'


/**
 * At the moment, this will catch all errors (can be anything) except for BaseError
  */
@Catch()
export class DefaultExceptionFilter extends AbstractExceptionFilter<Error> {

  protected getStatusCode(exception: Error): number {
    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  protected formatError(err: Error): ErrorPayload {
    const payload: ErrorPayload = {
      error: {
        code: ErrorCodes.GENERIC,
        message: err?.message ?? 'Internal server error',
        statusCode: this.getStatusCode(err),
      },
    }

    if (config.logs.enableStackLogging) {
      payload.stack = err.stack
    }

    return payload
  }
}
