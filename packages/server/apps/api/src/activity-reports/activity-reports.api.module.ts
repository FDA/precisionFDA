import { Module } from '@nestjs/common'
import { EventModule } from '@shared/domain/event/event.module'
import { ActivityReportsController } from './activity-reports.controller'

@Module({
  imports: [EventModule],
  controllers: [ActivityReportsController],
})
export class ActivityReportsApiModule {}
