import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { TrackApiFacade } from '../facade/track/track-api.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { TrackEntityIdentifierQueryDto } from './model/identifier-param.dto'

@UseGuards(UserContextGuard)
@Controller('/tracks')
export class TracksController {
  constructor(private readonly trackApiFacade: TrackApiFacade) {}

  @Get('/provenance')
  async getTrackProvenance(@Query() query: TrackEntityIdentifierQueryDto) {
    return await this.trackApiFacade.getProvenance(query.identifier)
  }
}
