import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { resultTypeToProviderProvider } from '@shared/domain/space-report/providers/result-type-to-provider.provider'
import { sourceTypeToPartContentProviderProvider } from '@shared/domain/space-report/providers/source-type-to-part-content-provider.provider'
import { SpaceReportResultHtmlProvider } from '@shared/domain/space-report/service/result/space-report-result-html.provider'
import { SpaceReportResultJsonProvider } from '@shared/domain/space-report/service/result/space-report-result-json.provider'
import { SpaceReportResultPartDiscussionHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-discussion-html-content.provider'
import { SpaceReportResultPartProvenanceTreeHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-provenance-tree-html-content.provider'
import { SpaceReportResultPartUserHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-user-html-content.provider'
import { SpaceReportResultService } from '@shared/domain/space-report/service/result/space-report-result.service'

@Module({
  imports: [EntityModule],
  providers: [
    SpaceReportResultService,
    SpaceReportResultPartProvenanceTreeHtmlContentProvider,
    SpaceReportResultPartUserHtmlContentProvider,
    SpaceReportResultPartDiscussionHtmlContentProvider,
    sourceTypeToPartContentProviderProvider,
    SpaceReportResultHtmlProvider,
    SpaceReportResultJsonProvider,
    resultTypeToProviderProvider,
  ],
  exports: [SpaceReportResultService],
})
export class SpaceReportResultModule {}
