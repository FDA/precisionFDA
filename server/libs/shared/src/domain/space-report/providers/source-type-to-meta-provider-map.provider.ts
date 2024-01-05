import { Provider } from '@nestjs/common'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportPartAppResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-app-result-meta.provider'
import { SpaceReportPartAssetResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-asset-result-meta.provider'
import { SpaceReportPartFileResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-file-result-meta.provider'
import { SpaceReportPartJobResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-job-result-meta.provider'
import { SpaceReportPartResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-result-meta.provider'
import { SpaceReportPartWorkflowResultMetaProvider } from '@shared/domain/space-report/service/part/space-report-part-workflow-result-meta.provider'

export const SOURCE_TYPE_TO_META_PROVIDER_MAP = 'SOURCE_TYPE_TO_META_PROVIDER_MAP'

export const sourceTypeToMetaProviderMapProvider: Provider = {
  provide: SOURCE_TYPE_TO_META_PROVIDER_MAP,
  inject: [
    SpaceReportPartAppResultMetaProvider,
    SpaceReportPartAssetResultMetaProvider,
    SpaceReportPartFileResultMetaProvider,
    SpaceReportPartJobResultMetaProvider,
    SpaceReportPartWorkflowResultMetaProvider,
  ],
  useFactory: (app, asset, file, job, workflow) =>
    ({ app, asset, file, job, workflow }) satisfies {
      [T in SpaceReportPartSourceType]: SpaceReportPartResultMetaProvider<T>
    },
}
