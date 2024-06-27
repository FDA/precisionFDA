import { Catch, HttpStatus, HttpException } from '@nestjs/common'
import { config } from '@shared/config'
import { ErrorCodes } from '@shared/errors'
import { AbstractExceptionFilter, ErrorPayload } from './abstract-exception.filter'

@Catch(HttpException)
export class HttpExceptionFilter extends AbstractExceptionFilter<HttpException> {
  protected getStatusCode(exception: HttpException): number {
    return exception.getStatus() ?? HttpStatus.BAD_REQUEST
  }

  protected formatError(exception: HttpException): ErrorPayload {
    const response = exception.getResponse()
    let message = 'Bad request'
    if (typeof response === 'object' && 'message' in response) {
      message = Array.isArray(response['message']) ? response['message'].join(', ') : response['message'].toString()
    }

    const payload: ErrorPayload = {
      error: {
        code: ErrorCodes.GENERIC,
        message: message,
        statusCode: this.getStatusCode(exception),
      },
    }

    if (config.logs.enableStackLogging) {
      payload.stack = exception.stack
    }

    return payload
  }

}
