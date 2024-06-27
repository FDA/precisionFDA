import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common'
import { isFunction } from '@nestjs/common/utils/shared.utils'
import { ClientRequestError } from '@shared/errors'
import { Response } from 'express'
import { ExecuteBodyDto } from '../model/execute-body.dto'
import { AdminPlatformClientService } from '../service/admin-platform-client.service'

@Controller()
export class AdminPlatformClientController {
  constructor(private readonly adminPlatformClientService: AdminPlatformClientService) {}

  @HttpCode(200)
  @Post('execute')
  async execute(@Body() body: ExecuteBodyDto, @Res() res: Response) {
    try {
      const result = await this.adminPlatformClientService.execute(body.method, body.params)
      res.send(result)
    } catch (error) {
      if (error instanceof ClientRequestError) {
        res.status(error.props.clientStatusCode ?? 500).send({
          errorType: 'ClientRequestError',
          message: error.message,
          clientResponse: error.props.clientResponse,
          clientStatusCode: error.props.clientStatusCode,
        })
      } else {
        const status = isFunction(error?.getStatus) ? error.getStatus() : 500
        res.status(status).send({ message: error.message })
      }
    }
  }
}
