import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportQueueJobProducer } from '@shared/domain/space-report/producer/space-report-queue-job.producer'
import { SpaceReportPartService } from '@shared/domain/space-report/service/part/space-report-part.service'
import { SpaceReportResultModule } from '@shared/domain/space-report/service/result/space-report-result.module'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { TimeUtils } from '@shared/utils/time.utils'

@Module({
  imports: [
    BullQueueModule.registerQueue({
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
  providers: [SpaceReportService, SpaceReportPartService, SpaceReportQueueJobProducer],
  exports: [SpaceReportService, BullQueueModule, MikroOrmModule, SpaceReportQueueJobProducer],
})
export class SpaceReportModule {}
