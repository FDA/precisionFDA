import { Module } from '@nestjs/common'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'

@Module({
  providers: [SpaceEventService],
  exports: [SpaceEventService],
})
export class SpaceEventModule {}
