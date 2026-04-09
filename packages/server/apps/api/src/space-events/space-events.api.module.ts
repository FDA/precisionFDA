import { Module } from '@nestjs/common'
import { SpaceEventModule } from '@shared/domain/space-event/space-event.module'
import { SpaceEventsController } from './space-events.controller'

@Module({
  imports: [SpaceEventModule],
  controllers: [SpaceEventsController],
})
export class SpaceEventsApiModule {}
