import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { SpaceReportApiFacadeModule } from '../facade/space-report/space-report-api-facade.module'
import { ReportsController } from './reports.controller'

@Module({
  imports: [SpaceReportApiFacadeModule, SpaceReportModule],
  controllers: [ReportsController],
})
export class ReportsApiModule {}
