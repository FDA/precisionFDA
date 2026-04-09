import { Module } from '@nestjs/common'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { SpaceReportCreateFacade } from './space-report-create.facade'
import { SpaceReportDeleteFacade } from './space-report-delete.facade'

@Module({
  imports: [SpaceReportModule, UserFileModule, RemoveNodesFacadeModule],
  providers: [SpaceReportCreateFacade, SpaceReportDeleteFacade],
  exports: [SpaceReportCreateFacade, SpaceReportDeleteFacade],
})
export class SpaceReportApiFacadeModule {}
