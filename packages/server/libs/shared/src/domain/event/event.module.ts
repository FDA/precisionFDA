import { EventHelper } from '@shared/domain/event/event.helper'
import { Module } from '@nestjs/common'

@Module({
  imports: [],
  providers: [EventHelper],
  exports: [EventHelper],
})
export class EventModule {}
