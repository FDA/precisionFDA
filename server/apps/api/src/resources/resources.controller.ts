import { Controller, Get, Header, Param, StreamableFile, UseGuards } from '@nestjs/common'
import { ResourceService } from '@shared/domain/resource/service/resource.service'
import axios from 'axios'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/resources')
export class ResourcesController {
  constructor(
    private readonly resourceService: ResourceService,
  ) {}

// This is not used at the moment. We are handling everything in rails.
// TODO: Once rails middleware is removed, add range requests handling and stream it directly to the client.
@Get(':uid/download')
@Header('Content-Type', 'application/octet-stream')
  async downloadResource(@Param('uid') fileUid: string) {
    const url = await this.resourceService.getDownloadUrl(fileUid)
    const response = await axios.get(url, { responseType: 'stream', timeout: 0 })
    return new StreamableFile(response.data)
  }

}
