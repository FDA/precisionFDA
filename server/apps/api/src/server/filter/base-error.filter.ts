import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { config, ENUMS } from '@shared'
import { BaseError } from '@shared/errors'
import { Response } from 'express'

@Catch(BaseError)
export class BaseErrorFilter implements ExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    response.status(exception.props.statusCode).json(this.formatError(exception))
  }

  private formatError(err: BaseError) {
    const payload: Record<string, any> = {
      error: {
        message: err.message,
        ...err.props,
      },
    }
    if (config.env !== ENUMS.ENVS.PRODUCTION) {
      payload.stack = err.stack
    }

    console.error(err)
    return payload
  }
}
