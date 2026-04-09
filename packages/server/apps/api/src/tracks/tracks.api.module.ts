import { Module } from '@nestjs/common'
import { TrackApiFacadeModule } from '../facade/track/track-api-facade.module'
import { TracksController } from './tracks.controller'

@Module({
  imports: [TrackApiFacadeModule],
  controllers: [TracksController],
})
export class TracksApiModule {}
