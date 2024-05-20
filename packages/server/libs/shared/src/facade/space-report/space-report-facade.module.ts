import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserFileCreateFacadeModule } from '@shared/facade/file-create/user-file-create-facade.module'
import { sourceTypeToResultProviderMapProvider } from '@shared/facade/space-report/provider/source-type-to-result-provider-map.provider'
import { SpaceReportPartAppResultProvider } from '@shared/facade/space-report/service/space-report-part-app-result-provider.service'
import { SpaceReportPartAssetResultProvider } from '@shared/facade/space-report/service/space-report-part-asset-result-provider.service'
import { SpaceReportPartDiscussionResultProviderService } from '@shared/facade/space-report/service/space-report-part-discussion-result-provider.service'
import { SpaceReportPartFileResultProvider } from '@shared/facade/space-report/service/space-report-part-file-result-provider.service'
import { SpaceReportPartJobResultProvider } from '@shared/facade/space-report/service/space-report-part-job-result-provider.service'
import { SpaceReportPartUserResultProvider } from '@shared/facade/space-report/service/space-report-part-user-result-provider.service'
import { SpaceReportPartWorkflowResultProvider } from '@shared/facade/space-report/service/space-report-part-workflow-result-provider.service'
import { SpaceReportBatchResultGenerateFacade } from '@shared/facade/space-report/space-report-batch-result-generate.facade'
import { SpaceReportResultGenerateFacade } from '@shared/facade/space-report/space-report-result-generate.facade'
import { SpaceReportErrorFacade } from './space-report-error.facade'

@Module({
  imports: [
    SpaceReportModule,
    EntityProvenanceModule,
    UserFileCreateFacadeModule,
    NotificationModule,
    UserFileModule,
    DiscussionModule,
  ],
  providers: [
    SpaceReportResultGenerateFacade,
    SpaceReportBatchResultGenerateFacade,
    SpaceReportErrorFacade,
    SpaceReportPartAppResultProvider,
    SpaceReportPartAssetResultProvider,
    SpaceReportPartFileResultProvider,
    SpaceReportPartJobResultProvider,
    SpaceReportPartUserResultProvider,
    SpaceReportPartWorkflowResultProvider,
    SpaceReportPartDiscussionResultProviderService,
    sourceTypeToResultProviderMapProvider,
  ],
  exports: [
    SpaceReportResultGenerateFacade,
    SpaceReportBatchResultGenerateFacade,
    SpaceReportErrorFacade,
  ],
})
export class SpaceReportFacadeModule {}
