import { Catch, HttpStatus } from '@nestjs/common'
import { ErrorCodes } from '@shared/errors'
import { DriverException } from '@mikro-orm/core'
import {
  AbstractExceptionFilter,
  ErrorPayload,
} from '@shared/errors/filter/abstract-exception.filter'
import { config } from '@shared/config'

@Catch(DriverException)
export class DatabaseExceptionFilter extends AbstractExceptionFilter<DriverException> {
  protected getStatusCode(_exception: Error): number {
    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  protected formatError(err: Error): ErrorPayload {
    const payload: ErrorPayload = {
      error: {
        code: ErrorCodes.SQL_ERROR,
        message: 'Unexpected database error',
        statusCode: this.getStatusCode(err),
      },
    }

    if (config.logs.enableStackLogging) {
      payload.stack = err.stack
    }

    return payload
  }
}
