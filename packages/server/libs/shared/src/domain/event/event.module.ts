import { Module } from '@nestjs/common'
import { ActivityReportService } from '@shared/domain/event/activity-report.service'
import { EventService } from '@shared/domain/event/event.service'
import { EventHelper } from '@shared/domain/event/event.helper'

@Module({
  imports: [],
  providers: [EventHelper, ActivityReportService, EventService],
  exports: [EventHelper, EventService],
})
export class EventModule {}
