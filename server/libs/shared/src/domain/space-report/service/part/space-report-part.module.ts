import { Module } from '@nestjs/common'
import { sourceTypeToMetaProviderMapProvider } from '@shared/domain/space-report/providers/source-type-to-meta-provider-map.provider'
import { SpaceReportPartAppResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-app-result-meta.provider'
import { SpaceReportPartAssetResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-asset-result-meta.provider'
import { SpaceReportPartFileResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-file-result-meta.provider'
import { SpaceReportPartJobResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-job-result-meta.provider'
import { SpaceReportPartWorkflowResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-workflow-result-meta.provider'
import { SpaceReportPartService } from '@shared/domain/space-report/service/part/space-report-part.service'

@Module({
  providers: [
    SpaceReportPartAppResultMetaProvider,
    SpaceReportPartAssetResultMetaProvider,
    SpaceReportPartFileResultMetaProvider,
    SpaceReportPartJobResultMetaProvider,
    SpaceReportPartWorkflowResultMetaProvider,
    sourceTypeToMetaProviderMapProvider,
    SpaceReportPartService,
  ],
  exports: [SpaceReportPartService],
})
export class SpaceReportPartModule {}
