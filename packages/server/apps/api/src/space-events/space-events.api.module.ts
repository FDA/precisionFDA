import { Module } from '@nestjs/common'
import { SpaceEventsController } from './space-events.controller'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'

@Module({
  imports: [SpaceEventModule],
  controllers: [SpaceEventsController],
})
export class SpaceEventsApiModule {}
