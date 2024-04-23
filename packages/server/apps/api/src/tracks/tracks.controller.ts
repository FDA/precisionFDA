import { Controller, UseGuards, Query, Get } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { TrackApiFacade } from './facade/track-api.facade'
import { ZodPipe } from '../validation/pipes/zod.pipe'
import { TrackProvenanceUidSchema } from './tracks.schema'

@UseGuards(UserContextGuard)
@Controller('/tracks')
export class TracksController {
  constructor(
    private readonly trackApiFacade: TrackApiFacade,
  ) {}

  @Get('/provenance')
  async getTrackProvenance(
    @Query('uid', new ZodPipe(TrackProvenanceUidSchema)) uid: string,
  ) {
    return await this.trackApiFacade.getProvenance(uid)
  }
}