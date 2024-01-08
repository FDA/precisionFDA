import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { config } from '@shared/config'
import { ENVS } from '@shared/enums'
import { BaseError } from '@shared/errors'
import { Response } from 'express'

@Catch()
export class DefaultExceptionFilter implements ExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    response.status(500).json(this.formatError(exception))
  }

  private formatError(err: Error) {
    const payload: Record<string, any> = {
      error: {
        message: err.message,
        name: err.name,
        code: 'GENERIC',
      },
    }
    if (config.env !== ENVS.PRODUCTION) {
      payload.stack = err.stack
    }
    console.error(err)
    return payload
  }
}
