import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { sourceTypeToPartContentProviderProvider } from '@shared/domain/space-report/providers/source-type-to-part-content-provider.provider'
import { SpaceReportResultPartDiscussionContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-discussion-content.provider'
import { SpaceReportResultPartProvenanceTreeContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-provenance-tree-content.provider'
import { SpaceReportResultPartUserContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-user-content.provider'
import { SpaceReportResultService } from '@shared/domain/space-report/service/result/space-report-result.service'

@Module({
  imports: [EntityModule],
  providers: [
    SpaceReportResultService,
    SpaceReportResultPartProvenanceTreeContentProvider,
    SpaceReportResultPartUserContentProvider,
    SpaceReportResultPartDiscussionContentProvider,
    sourceTypeToPartContentProviderProvider,
  ],
  exports: [SpaceReportResultService],
})
export class SpaceReportResultModule {}
