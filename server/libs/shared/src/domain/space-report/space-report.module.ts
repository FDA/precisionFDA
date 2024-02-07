import { MikroOrmModule } from '@mikro-orm/nestjs'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportPartAppResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-app-result-meta.provider'
import { SpaceReportPartAssetResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-asset-result-meta.provider'
import { SpaceReportPartFileResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-file-result-meta.provider'
import { SpaceReportPartJobResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-job-result-meta.provider'
import { SpaceReportPartWorkflowResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-workflow-result-meta.provider'
import { SpaceReportPartModule } from '@shared/domain/space-report/service/part/space-report-part.module'
import { SpaceReportResultService } from '@shared/domain/space-report/service/space-report-result.service'
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
    MikroOrmModule.forFeature([SpaceReport]),
    SpaceReportPartModule,
    NotificationModule,
  ],
  providers: [
    SpaceReportService,
    SpaceReportResultService,
    SpaceReportPartAppResultMetaProvider,
    SpaceReportPartWorkflowResultMetaProvider,
    SpaceReportPartJobResultMetaProvider,
    SpaceReportPartFileResultMetaProvider,
    SpaceReportPartAssetResultMetaProvider,
  ],
  exports: [SpaceReportService, BullModule, MikroOrmModule],
})
export class SpaceReportModule {}
