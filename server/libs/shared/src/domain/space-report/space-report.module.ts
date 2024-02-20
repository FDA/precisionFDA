import { MikroOrmModule } from '@mikro-orm/nestjs'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportPartService } from '@shared/domain/space-report/service/part/space-report-part.service'
import { SpaceReportResultModule } from '@shared/domain/space-report/service/result/space-report-result.module'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { TimeUtils } from '@shared/utils/time.utils'

@Module({
  imports: [
    BullModule.registerQueue({
      name: config.workerJobs.queues.spaceReport.name,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: { age: TimeUtils.weeksToSeconds(1) },
        priority: 2,
        attempts: 3,
        backoff: TimeUtils.minutesToMilliseconds(1),
      },
    }),
    SpaceReportResultModule,
    MikroOrmModule.forFeature([SpaceReport]),
    NotificationModule,
  ],
  providers: [SpaceReportService, SpaceReportPartService],
  exports: [SpaceReportService, BullModule, MikroOrmModule],
})
export class SpaceReportModule {}
