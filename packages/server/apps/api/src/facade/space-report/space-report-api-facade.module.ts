import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { SpaceReportCreateFacade } from './space-report-create.facade'
import { SpaceReportDeleteFacade } from './space-report-delete.facade'

@Module({
  imports: [SpaceReportModule, UserFileModule],
  providers: [SpaceReportCreateFacade, SpaceReportDeleteFacade],
  exports: [SpaceReportCreateFacade, SpaceReportDeleteFacade],
})
export class SpaceReportApiFacadeModule {}
