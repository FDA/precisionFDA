import { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { ErrorCodes } from '@shared/errors'
import { Response } from 'express'


export type ErrorPayload = {
  error: {
    message: string
    statusCode: number
    code: ErrorCodes
  }
  stack?: string
}

export abstract class AbstractExceptionFilter<T> implements ExceptionFilter {

  protected abstract getStatusCode(exception: T): number

  protected abstract formatError(exception: T): ErrorPayload

  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    console.error(exception)
    response.status(this.getStatusCode(exception)).json(this.formatError(exception))
  }
}
