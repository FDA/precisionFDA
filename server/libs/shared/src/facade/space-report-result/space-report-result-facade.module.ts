import { Module } from '@nestjs/common'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserFileCreateFacadeModule } from '@shared/facade/file-create/user-file-create-facade.module'
import { SpaceReportResultGenerateFacade } from '@shared/facade/space-report-result/space-report-result-generate.facade'

@Module({
  imports: [
    SpaceReportModule,
    EntityProvenanceModule,
    UserFileCreateFacadeModule,
    NotificationModule,
    UserFileModule,
  ],
  providers: [SpaceReportResultGenerateFacade],
  exports: [SpaceReportResultGenerateFacade],
})
export class SpaceReportResultFacadeModule {}
