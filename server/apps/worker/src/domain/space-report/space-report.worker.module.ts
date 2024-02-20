import { Module } from '@nestjs/common'
import { SpaceReportFacadeModule } from '@shared/facade/space-report/space-report-facade.module'
import { SpaceReportProcessor } from './processor/space-report.processor'

@Module({
  imports: [SpaceReportFacadeModule],
  providers: [SpaceReportProcessor],
})
export class SpaceReportWorkerModule {}
