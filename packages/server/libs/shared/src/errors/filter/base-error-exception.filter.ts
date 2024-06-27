import { Catch } from '@nestjs/common'
import { BaseError } from '@shared/errors'
import { config } from '@shared/config'
import { AbstractExceptionFilter, ErrorPayload } from './abstract-exception.filter'

@Catch(BaseError)
export class BaseErrorExceptionFilter extends AbstractExceptionFilter<BaseError> {

  protected getStatusCode(exception: BaseError): number {
    return exception.props.statusCode ?? 500
  }

  protected formatError(exception: BaseError): ErrorPayload {
    const payload: ErrorPayload = {
      error: {
        code: exception.props.code,
        message: exception.message,
        statusCode: this.getStatusCode(exception),
      },
    }
    if (config.logs.enableStackLogging) {
      payload.stack = exception.stack
    }

    return payload
  }
}
