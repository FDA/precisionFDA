import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { EntityIdentifierQueryDTO } from '@shared/domain/entity/domain/entity-identifier-query.dto'
import { TrackProvenanceDTO } from '../facade/track/model/track-provenance.dto'
import { TrackApiFacade } from '../facade/track/track-api.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/tracks')
export class TracksController {
  constructor(private readonly trackApiFacade: TrackApiFacade) {}

  @Get('/provenance')
  async getTrackProvenance(@Query() query: EntityIdentifierQueryDTO): Promise<TrackProvenanceDTO> {
    return await this.trackApiFacade.getProvenance(query.identifier)
  }
}
