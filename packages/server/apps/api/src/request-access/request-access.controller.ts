import { Body, Controller, Headers, Post } from '@nestjs/common'
import { config } from '@shared/config'
import { RequestAccessDTO } from '@shared/domain/invitation/dto/request-access.dto'
import { RequestAccessFacade } from '@shared/facade/request-access/request-access.facade'

@Controller('request-access')
export class RequestAccessController {
  constructor(private readonly requestAccessFacade: RequestAccessFacade) {}

  @Post()
  async createRequestAccess(
    @Body() body: RequestAccessDTO,
    @Headers() headers: Record<string, string>,
  ): Promise<{ id: number }> {
    const ip = headers[config.api.nginxIpHeader]
    body.ip = ip
    return await this.requestAccessFacade.requestAccess(body)
  }
}
