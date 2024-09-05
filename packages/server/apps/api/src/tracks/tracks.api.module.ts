import { Module } from '@nestjs/common'
import { TracksController } from './tracks.controller'
import { TrackApiFacadeModule } from '../facade/track/track-api-facade.module'

@Module({
  imports: [TrackApiFacadeModule],
  controllers: [TracksController],
})
export class TracksApiModule {}
