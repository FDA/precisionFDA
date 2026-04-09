import { Module } from '@nestjs/common'
import { EventHelper } from '@shared/domain/event/event.helper'

@Module({
  imports: [],
  providers: [EventHelper],
  exports: [EventHelper],
})
export class EventModule {}
