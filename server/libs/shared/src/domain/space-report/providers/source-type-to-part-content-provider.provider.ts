import { Provider } from '@nestjs/common'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportResultPartContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-content.provider'
import {
  SpaceReportResultPartDiscussionContentProvider
} from '@shared/domain/space-report/service/result/space-report-result-part-discussion-content.provider'
import { SpaceReportResultPartProvenanceTreeContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-provenance-tree-content.provider'
import { SpaceReportResultPartUserContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-user-content.provider'

export const SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP = 'SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP'

export const sourceTypeToPartContentProviderProvider: Provider = {
  provide: SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP,
  inject: [
    SpaceReportResultPartProvenanceTreeContentProvider,
    SpaceReportResultPartUserContentProvider,
    SpaceReportResultPartDiscussionContentProvider,
  ],
  useFactory: (
    provenance: SpaceReportResultPartProvenanceTreeContentProvider,
    user: SpaceReportResultPartUserContentProvider,
    discussion: SpaceReportResultPartDiscussionContentProvider,
  ) =>
    ({
      app: provenance,
      asset: provenance,
      file: provenance,
      job: provenance,
      workflow: provenance,
      user,
      discussion,
    }) satisfies { [T in SpaceReportPartSourceType]: SpaceReportResultPartContentProvider<T> },
}
