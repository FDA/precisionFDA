import { Module } from '@nestjs/common'
import { SpaceReportBatchFacadeModule } from '@shared/facade/space-report-batch/space-report-batch-facade.module'
import { SpaceReportResultFacadeModule } from '@shared/facade/space-report-result/space-report-result-facade.module'
import { SpaceReportProcessor } from './processor/space-report.processor'

@Module({
  imports: [SpaceReportBatchFacadeModule, SpaceReportResultFacadeModule],
  providers: [SpaceReportProcessor],
})
export class SpaceReportWorkerModule {}
