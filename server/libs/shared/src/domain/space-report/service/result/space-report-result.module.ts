import { Module } from '@nestjs/common'
import {
  sourceTypeToPartContentProviderProvider
} from '@shared/domain/space-report/providers/source-type-to-part-content-provider.provider'
import { SpaceReportResultPartProvenanceTreeContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-provenance-tree-content.provider'
import { SpaceReportResultPartUserContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-user-content.provider'
import { SpaceReportResultService } from '@shared/domain/space-report/service/result/space-report-result.service'

@Module({
  providers: [
    SpaceReportResultService,
    SpaceReportResultPartProvenanceTreeContentProvider,
    SpaceReportResultPartUserContentProvider,
    sourceTypeToPartContentProviderProvider,
  ],
  exports: [SpaceReportResultService],
})
export class SpaceReportResultModule {}
