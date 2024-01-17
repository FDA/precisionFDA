import { Controller, UseGuards, Query, Get, UsePipes } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { TrackApiFacade } from './facade/track-api.facade'
import { ZodPipe } from '../validation/pipes/zod.pipe'
import { schemas } from '@shared/utils/base-schemas'

@UseGuards(UserContextGuard)
@Controller('/tracks')
export class TracksController {
  constructor(
    private readonly trackApiFacade: TrackApiFacade,
  ) {}

  @Get('/provenance')
  @UsePipes(new ZodPipe(schemas.uidSchema))
  async getTrackProvenance(
    @Query('uid') uid: string,
  ) {
    return await this.trackApiFacade.getProvenance(uid)
  }
}