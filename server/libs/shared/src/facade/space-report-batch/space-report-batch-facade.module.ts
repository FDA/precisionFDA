import { Module } from '@nestjs/common'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { SpaceReportModule } from '@shared/domain/space-report/space-report.module'
import { sourceTypeToResultProviderMapProvider } from '@shared/facade/space-report-batch/provider/source-type-to-result-provider-map.provider'
import { SpaceReportPartAppResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-app-result-provider.service'
import { SpaceReportPartAssetResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-asset-result-provider.service'
import { SpaceReportPartFileResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-file-result-provider.service'
import { SpaceReportPartJobResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-job-result-provider.service'
import { SpaceReportPartUserResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-user-result-provider.service'
import { SpaceReportPartWorkflowResultProvider } from '@shared/facade/space-report-batch/service/space-report-part-workflow-result-provider.service'
import { SpaceReportBatchResultGenerateFacade } from '@shared/facade/space-report-batch/space-report-batch-result-generate.facade'

@Module({
  imports: [SpaceReportModule, EntityProvenanceModule],
  providers: [
    SpaceReportBatchResultGenerateFacade,
    SpaceReportPartAppResultProvider,
    SpaceReportPartAssetResultProvider,
    SpaceReportPartFileResultProvider,
    SpaceReportPartJobResultProvider,
    SpaceReportPartWorkflowResultProvider,
    SpaceReportPartUserResultProvider,
    sourceTypeToResultProviderMapProvider,
  ],
  exports: [SpaceReportBatchResultGenerateFacade],
})
export class SpaceReportBatchFacadeModule {}
