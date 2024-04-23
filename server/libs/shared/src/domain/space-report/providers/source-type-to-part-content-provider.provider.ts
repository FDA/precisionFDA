import { Provider } from '@nestjs/common'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportResultPartHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-html-content.provider'
import {
  SpaceReportResultPartDiscussionHtmlContentProvider
} from '@shared/domain/space-report/service/result/space-report-result-part-discussion-html-content.provider'
import { SpaceReportResultPartProvenanceTreeHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-provenance-tree-html-content.provider'
import { SpaceReportResultPartUserHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-user-html-content.provider'

export const SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP = 'SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP'

export const sourceTypeToPartContentProviderProvider: Provider = {
  provide: SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP,
  inject: [
    SpaceReportResultPartProvenanceTreeHtmlContentProvider,
    SpaceReportResultPartUserHtmlContentProvider,
    SpaceReportResultPartDiscussionHtmlContentProvider,
  ],
  useFactory: (
    provenance: SpaceReportResultPartProvenanceTreeHtmlContentProvider,
    user: SpaceReportResultPartUserHtmlContentProvider,
    discussion: SpaceReportResultPartDiscussionHtmlContentProvider,
  ) =>
    ({
      app: provenance,
      asset: provenance,
      file: provenance,
      job: provenance,
      workflow: provenance,
      user,
      discussion,
    }) satisfies { [T in SpaceReportPartSourceType]: SpaceReportResultPartHtmlContentProvider<T> },
}
