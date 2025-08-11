import { ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common'
import { ErrorCodes, UnauthorizedRequestError, ValidationError } from '@shared/errors'
import { Response } from 'express'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

export type ErrorPayload = {
  error: {
    message: string
    statusCode: number
    code: ErrorCodes
  }
  stack?: string
}

export abstract class AbstractExceptionFilter<T> implements ExceptionFilter {
  @ServiceLogger()
  private readonly logger: Logger

  // Add a list of error codes or classes that should not be logged
  private readonly suppressedErrors = [UnauthorizedRequestError, ValidationError]

  protected abstract getStatusCode(exception: T): number

  protected abstract formatError(exception: T): ErrorPayload

  catch(exception: T, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const shouldSuppress = this.suppressedErrors.some((err) => exception instanceof err)

    if (shouldSuppress) {
      this.logger.log(exception)
    } else {
      this.logger.error(exception)
    }

    response.status(this.getStatusCode(exception)).json(this.formatError(exception))
  }
}
