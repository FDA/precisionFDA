import { Catch } from '@nestjs/common'
import { BaseError } from '@shared/errors'
import { config } from '@shared/config'
import { AbstractExceptionFilter, ErrorPayload } from './abstract-exception.filter'

@Catch(BaseError)
export class BaseErrorExceptionFilter extends AbstractExceptionFilter<BaseError> {

  protected getStatusCode(exception: BaseError): number {
    return exception.props.statusCode ?? 500
  }

  protected formatError(err: BaseError): ErrorPayload {
    const payload: ErrorPayload = {
      error: {
        code: err.props.code,
        message: err.message,
        statusCode: this.getStatusCode(err),
      },
    }
    if (config.logs.enableStackLogging) {
      payload.stack = err.stack
    }

    return payload
  }
}
